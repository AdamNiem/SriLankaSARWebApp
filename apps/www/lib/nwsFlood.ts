// Lightweight helper to query api.weather.gov for historical precipitation
// observations near a lat/lon and compute a simple flood-probability heuristic
// based on previous years' precipitation on or near the same date.
//
// Notes/limitations:
// - The public NWS API exposes stations and recent observations. Long-term
//   historical coverage varies by station. This helper attempts to fetch
//   observations for the same month/day for the previous N years and computes
//   statistics. If insufficient data is available it returns null so callers
//   can fall back to other heuristics.
// - User-Agent header is recommended by the API (we set a generic one).

type NWSResult = {
  flood_probability: number;
  confidence: number;
  meta?: Record<string, any>;
} | null;

// Configurable heuristics
const USER_AGENT = 'SARWebApp/1.0 (dev@local)';
const DEFAULT_YEARS = 5;
const MAX_STATIONS = 3;
const DEFAULT_PRE_DAYS = 3; // antecedent days to include for moisture
const EXCEED_THRESHOLD_MM = 25; // threshold in mm considered 'heavy' (tunable)
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

// Simple in-memory cache to avoid repeated NWS queries during development
const cache = new Map<string, { ts: number; value: NWSResult }>();

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/geo+json,application/json' } });
  if (!res.ok) throw new Error(`NWS fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

function isoDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

function normalizePrecip(value: number, unitCode?: string | null) {
  // Try to normalize to millimeters.
  // If the unitCode contains 'inch' convert to mm. Otherwise assume value is already mm.
  if (!Number.isFinite(value)) return 0;
  if (!unitCode) return value; // unknown, return as-is
  const uc = String(unitCode).toLowerCase();
  if (uc.includes('inch') || uc.includes('inches') || uc.includes('us/in')) {
    return value * 25.4; // inches -> mm
  }
  // other unit codes sometimes use 'm' for meters (unlikely for precip) or 'mm'
  if (uc.includes('mm')) return value;
  if (uc.includes('m')) return value * 1000; // meters -> mm
  return value; // fallback
}

export async function estimateFloodProbabilityWithNWS(lat: number, lon: number, isoDate: string, years = DEFAULT_YEARS, preDays = DEFAULT_PRE_DAYS): Promise<NWSResult> {
  const cacheKey = `${lat}:${lon}:${isoDate}:y${years}:p${preDays}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.value;
  }

  try {
    // 1) Determine gridpoint/stations for lat/lon
    const pUrl = `https://api.weather.gov/points/${lat},${lon}`;
    const points = await fetchJson(pUrl);

    const stationsLink = points?.properties?.observationStations;
    const forecastGridData = points?.properties?.forecastGridData;
    const useGridpointForForecast = !!forecastGridData;

    // Collect samples from station observations (historical) across previous years
    const stationsList = stationsLink ? await fetchJson(stationsLink) : null;
    const stations: string[] = (stationsList?.features || []).map((f: any) => f?.id).filter(Boolean);
    if (!stations || stations.length === 0) {
      // no stations — still cache null
      cache.set(cacheKey, { ts: Date.now(), value: null });
      return null;
    }

    const useStations = stations.slice(0, MAX_STATIONS);

    const target = new Date(isoDate);
    if (Number.isNaN(target.getTime())) {
      cache.set(cacheKey, { ts: Date.now(), value: null });
      return null;
    }

    const month = target.getUTCMonth() + 1;
    const day = target.getUTCDate();

    const yearsToCheck = Math.min(years, 10);
    const precipValues: number[] = [];

    for (let y = 1; y <= yearsToCheck; y++) {
      const year = target.getUTCFullYear() - y;
      // Build UTC range covering target day plus antecedent days
      const startDate = new Date(Date.UTC(year, month - 1, day));
      startDate.setUTCDate(startDate.getUTCDate() - preDays);
      const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
      const start = isoDateOnly(startDate) + 'T00:00:00Z';
      const end = isoDateOnly(endDate) + 'T23:59:59Z';

      let yearPrecip = 0;

      for (const station of useStations) {
        try {
          const obsUrl = `${station}/observations?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
          const observations = await fetchJson(obsUrl);
          const features = observations?.features || [];
          if (!features.length) continue;

          // Sum precipitation values for the range, normalizing units when possible
          let dayPrecip = 0;
          for (const f of features) {
            const p = f?.properties;
            if (!p) continue;
            // Try common fields and unit codes
            if (typeof p.precipitationLastHour === 'number') dayPrecip += normalizePrecip(p.precipitationLastHour, p.precipitationLastHourUnit || p.unitCode || p.uom || null);
            if (typeof p.precipitationLast3Hours === 'number') dayPrecip += normalizePrecip(p.precipitationLast3Hours, p.precipitationLast3HoursUnit || p.unitCode || p.uom || null);
            if (typeof p.precipitationLast6Hours === 'number') dayPrecip += normalizePrecip(p.precipitationLast6Hours, p.precipitationLast6HoursUnit || p.unitCode || p.uom || null);
            if (typeof p.precipitationLast24Hours === 'number') dayPrecip += normalizePrecip(p.precipitationLast24Hours, p.precipitationLast24HoursUnit || p.unitCode || p.uom || null);
            if (typeof p.precipitationAmount === 'number') dayPrecip += normalizePrecip(p.precipitationAmount, p.precipitationAmountUnit || p.unitCode || p.uom || null);
            if (p.precipitation && typeof p.precipitation.value === 'number') dayPrecip += normalizePrecip(p.precipitation.value, p.precipitation?.unitCode || p.precipitation?.uom || null);
            // Some observations include 'value' with unit in a separate field
            if (typeof p.value === 'number' && p.added === 'precip') dayPrecip += normalizePrecip(p.value, p.unitCode || p.uom || null);
          }

          if (dayPrecip > 0) {
            yearPrecip = dayPrecip;
            break; // stop after first station with data for that year
          }
        } catch (e) {
          // ignore station fetch errors
        }
      }

      if (yearPrecip > 0) precipValues.push(yearPrecip);
    }

    // If we found no historical station data, but the requested isoDate is near-term, try gridpoint forecast quantitativePrecipitation
    if (precipValues.length === 0 && useGridpointForForecast) {
      try {
        const g = await fetchJson(forecastGridData);
        const qpp = g?.properties?.quantitativePrecipitation?.values || g?.properties?.quantitativePrecipitation?.values || null;
        // qpp is a time series; try to locate entries matching the month/day of the target across recent years (if present)
        if (qpp && Array.isArray(qpp)) {
          // We'll sample any values whose start time matches month/day
          for (const v of qpp) {
            const vt = v?.validTime || v?.validTime?.split?.('/')?.[0] || v?.validTime;
            if (!vt) continue;
            const dateStr = String(v?.validTime || v?.validTime?.split?.('/')[0]);
            // parse leading date
            const d = new Date(dateStr);
            if (Number.isNaN(d.getTime())) continue;
            if (d.getUTCMonth() + 1 === month && d.getUTCDate() === day) {
              const val = v?.value ?? v?.value;
              if (typeof val === 'number') precipValues.push(val);
            }
          }
        }
      } catch (e) {
        // ignore gridpoint failure
      }
    }

    if (precipValues.length === 0) {
      cache.set(cacheKey, { ts: Date.now(), value: null });
      return null; // insufficient data
    }

    // Compute stats
    const total = precipValues.reduce((a, b) => a + b, 0);
    const mean = total / precipValues.length;
    const max = Math.max(...precipValues);
    const exceedCount = precipValues.filter((v) => v > EXCEED_THRESHOLD_MM).length;

    const baseProb = Math.min(95, Math.round((exceedCount / precipValues.length) * 100));
    const scale = Math.min(1, mean / (Math.max(1, max)) + 0.5);
    const floodProbability = Math.round(Math.min(99, baseProb * (0.6 + 0.4 * scale)));

    const confidence = Math.min(0.99, 0.2 + (precipValues.length / yearsToCheck) * 0.8);

    const result: NWSResult = {
      flood_probability: floodProbability,
      confidence: Number(confidence.toFixed(2)),
      meta: { method: 'nws-historical-heuristic', sample_count: precipValues.length, mean, max, samples: precipValues, usedGridpoint: useGridpointForForecast },
    };

    cache.set(cacheKey, { ts: Date.now(), value: result });
    return result;
  } catch (err) {
    cache.set(cacheKey, { ts: Date.now(), value: null });
    return null;
  }
  try {
    // 1) Determine gridpoint/stations for lat/lon
    const pUrl = `https://api.weather.gov/points/${lat},${lon}`;
    const points = await fetchJson(pUrl);

    const stationsLink = points?.properties?.observationStations;
    if (!stationsLink) return null;

    const stationsList = await fetchJson(stationsLink);
    const stations: string[] = (stationsList?.features || []).map((f: any) => f?.id).filter(Boolean);
    if (!stations || stations.length === 0) return null;

    // We'll query up to the first 3 stations for robustness
    const useStations = stations.slice(0, 3);

    // Parse target month/day
    const target = new Date(isoDate);
    if (Number.isNaN(target.getTime())) return null;
    const month = target.getUTCMonth() + 1;
    const day = target.getUTCDate();

    // For each previous year, attempt to fetch observations for that station on that date
    const nowYear = new Date().getUTCFullYear();
    const yearsToCheck = Math.min(years, 10);

    const precipValues: number[] = [];

    for (let y = 1; y <= yearsToCheck; y++) {
      const year = target.getUTCFullYear() - y;
      // Build UTC start/end for that calendar day
      const start = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`;
      const end = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59Z`;

      for (const station of useStations) {
        try {
          const obsUrl = `${station}/observations?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
          const observations = await fetchJson(obsUrl);
          const features = observations?.features || [];
          if (!features.length) continue;

          // Sum precipitation fields found in observations for the day.
          // Observation properties vary; look for precipitationLastHour, precipAccumulation, or precipitationLast24Hours
          let dayPrecip = 0;
          for (const f of features) {
            const p = f?.properties;
            if (!p) continue;
            if (typeof p.precipitationLastHour === 'number') dayPrecip += p.precipitationLastHour;
            if (typeof p.precipitationLast3Hours === 'number') dayPrecip += p.precipitationLast3Hours;
            if (typeof p.precipitationLast6Hours === 'number') dayPrecip += p.precipitationLast6Hours;
            if (typeof p.precipitationLast24Hours === 'number') dayPrecip += p.precipitationLast24Hours;
            if (typeof p.precipitationAmount === 'number') dayPrecip += p.precipitationAmount;
            // in some payloads precipitation may be nested under 'precipitation' object
            if (p.precipitation && typeof p.precipitation.value === 'number') dayPrecip += p.precipitation.value;
          }

          if (dayPrecip > 0) {
            // The NWS units are typically meters for gridpoint but for station obs it's often mm or inches depending on field; we treat numbers uniformly as relative
            precipValues.push(dayPrecip);
            // break to next year once we got data from a station for that day
            break;
          }
        } catch (e) {
          // ignore station fetch errors and try next
        }
      }
    }

    if (precipValues.length === 0) return null; // insufficient data

    // Compute simple statistics
    const total = precipValues.reduce((a, b) => a + b, 0);
    const mean = total / precipValues.length;
    const max = Math.max(...precipValues);
    const exceedCount = precipValues.filter((v) => v > 10).length; // arbitrary threshold

    // Heuristic flood probability:
    // base on fraction of historical years with heavy precipitation plus scaling by mean/max
    const baseProb = Math.min(95, Math.round((exceedCount / precipValues.length) * 100));
    const scale = Math.min(1, mean / (Math.max(1, max)) + 0.5);
    const floodProbability = Math.round(Math.min(99, baseProb * (0.6 + 0.4 * scale)));

    const confidence = Math.min(0.99, 0.2 + (precipValues.length / yearsToCheck) * 0.8);

    return {
      flood_probability: floodProbability,
      confidence: Number(confidence.toFixed(2)),
      meta: { method: 'nws-historical-heuristic', sample_count: precipValues.length, mean, max, samples: precipValues },
    };
  } catch (err) {
    return null;
  }
}

export default estimateFloodProbabilityWithNWS;
