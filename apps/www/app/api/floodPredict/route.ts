import estimateFloodProbabilityWithNWS from '@/lib/nwsFlood'
import { NextResponse } from 'next/server'

// Internal helper for computing deterministic probability (useful for tests)
function computeFloodProbability(lat: string, lon: string, date: string) {
  const seed = `${lat}:${lon}:${date}`
  let hash = 2166136261 >>> 0
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619) >>> 0
  }

  const p = (hash % 10000) / 10000
  return Number((p * 100).toFixed(2))
}

/**
 * Simple deterministic flood prediction stub.
 * - Accepts query params: lat, lon, date
 * - Returns JSON: { flood_probability: number } or { error: string }
 *
 * This is a lightweight server-side stub so the Chatbot has a working
 * endpoint during development. Replace with real model/inference later.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const lat = url.searchParams.get('lat')
    const lon = url.searchParams.get('lon')
    const date = url.searchParams.get('date')

    if (!lat || !lon || !date) {
      return NextResponse.json(
        { error: 'Missing latitude, longitude and/or date' },
        { status: 400 }
      )
    }

    // Input validation: numeric coords and simple date format YYYY-MM-DD
    const latNum = Number(lat)
    const lonNum = Number(lon)
    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
      return NextResponse.json(
        { error: 'Latitude and longitude must be numbers' },
        { status: 400 }
      )
    }
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return NextResponse.json(
        { error: 'Latitude or longitude out of range' },
        { status: 400 }
      )
    }

    // Expect date in day month year (DMY). Accept separators: space, /, -
    // Examples: "04 10 2025", "4/10/2025", "04-10-2025"
    const dmy = date.trim()
    // Normalize separators to single space
    const parts = dmy.split(/[\s\/\-]+/).filter(Boolean)
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Date must be day/month/year' }, { status: 400 })
    }

    const [dStr, mStr, yStr] = parts
    const day = Number(dStr)
    const month = Number(mStr)
    const year = Number(yStr)
    if ([day, month, year].some((n) => Number.isNaN(n))) {
      return NextResponse.json({ error: 'Date contains non-numeric parts' }, { status: 400 })
    }

    // Basic calendar validation
    if (year < 1900 || year > 2100) {
      return NextResponse.json({ error: 'Year out of range' }, { status: 400 })
    }
    if (month < 1 || month > 12) {
      return NextResponse.json({ error: 'Month out of range' }, { status: 400 })
    }
    const daysInMonth = new Date(year, month, 0).getDate()
    if (day < 1 || day > daysInMonth) {
      return NextResponse.json({ error: 'Day out of range for month' }, { status: 400 })
    }

    // Normalize to ISO YYYY-MM-DD
    const isoDate = `${year.toString().padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // If an external inference service is configured, proxy the request to it.
    const INFERENCE_URL = process.env.INFERENCE_URL
    if (INFERENCE_URL) {
      try {
        const endpoint = `${INFERENCE_URL.replace(/\/$/, '')}/predict`
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: latNum, lon: lonNum, date: isoDate }),
        })
        const json = await resp.json()
        if (resp.ok && json && typeof json.flood_probability === 'number') {
          // Return whatever the inference service returned (trust its shape)
          return NextResponse.json(json, { status: resp.status })
        }

        return NextResponse.json({ error: 'Inference service error' }, { status: 502 })
      } catch (e) {
        return NextResponse.json({ error: 'Inference service unreachable' }, { status: 502 })
      }
    }

    // Query params to control heuristic behavior
    const force = url.searchParams.get('force') || ''; // 'nws' to force NWS, 'stub' to force dev-stub
    const yearsParam = Number(url.searchParams.get('years') || '0');
    const predaysParam = Number(url.searchParams.get('predays') || '0');
    const yearsToUse = Number.isFinite(yearsParam) && yearsParam > 0 ? yearsParam : 5;
    const predaysToUse = Number.isFinite(predaysParam) && predaysParam > 0 ? predaysParam : 3;

    // Attempt to use NWS historical heuristic to estimate flood probability unless forced to stub
    if (force !== 'stub') {
      try {
        const nws = await estimateFloodProbabilityWithNWS(latNum, lonNum, isoDate, yearsToUse, predaysToUse)
        if (nws && typeof nws.flood_probability === 'number') {
          return NextResponse.json({
            flood_probability: nws.flood_probability,
            confidence: nws.confidence,
            meta: { ...nws.meta, normalized_date: isoDate, method_used: 'nws-historical-heuristic' },
          })
        }
      } catch (e) {
        // ignore and fall back to dev-stub
      }
    }

    // Create a deterministic pseudo-random number from inputs so responses
    // are repeatable for the same input (helpful for testing).
    const floodProbability = computeFloodProbability(lat, lon, isoDate)

    // Include a simple confidence estimate (higher when probability is extreme)
    const confidence = Number((Math.abs(floodProbability - 50) / 50).toFixed(2))

    return NextResponse.json({
      flood_probability: floodProbability,
      confidence,
      meta: { model: 'dev-stub', deterministic: true, normalized_date: isoDate },
    })
  } catch (err) {
    // Keep error messages generic to avoid leaking internals
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
