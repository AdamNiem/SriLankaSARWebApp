'use client';

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import L, { Map } from "leaflet";

const { BaseLayer } = LayersControl;

declare global {
  interface Window {
    mapInstance?: L.Map;
  }
}

export default function SriLankaFloodMap() {
  const [activeLayer, setActiveLayer] = useState<string>("Flood Map");
  const mapRef = useRef<L.Map | null>(null);

  // Un-encoded {z}/{x}/{y} templates so Leaflet can substitute correctly
  const floodMapUrl = "https://earthengine.googleapis.com/v1/projects/nasa-app-25-sar/maps/26ddb76ab2fbb3f388e742634e83bd88-cc486d14797a5253d2461d7ccd82bf2b/tiles/{z}/{x}/{y}";
  const normalMapUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const rawDataUrl = "https://earthengine.googleapis.com/v1/projects/nasa-app-25-sar/maps/c92b0f457018f5a42445f3b1c05f69ac-f7d3aa078258686a01d46a7af2fb06aa/tiles/{z}/{x}/{y}";
  const building2016Url = "https://earthengine.googleapis.com/v1/projects/nasa-app-25-sar/maps/d366627d72bb044a05ef5085699082b9-5cb9b0b453d4eb3710b295214b5c33ba/tiles/{z}/{x}/{y}";
  const building2025Url = "https://earthengine.googleapis.com/v1/projects/nasa-app-25-sar/maps/90d1fcc4db525a9abd44920c390d2d1c-a09fad64b5fdb21eb43de6bf4ae26cca/tiles/{z}/{x}/{y}";

  // Add legend control
  useEffect(() => {
    if (!mapRef.current) return;

    const LegendControl = L.Control.extend({
      onAdd: function () {
        const div = L.DomUtil.create("div", "legend");
        div.style.background = "white";
        div.style.padding = "8px";
        div.style.borderRadius = "6px";
        div.style.boxShadow = "0 0 8px rgba(0,0,0,0.2)";
        div.style.color = "black";
        div.style.fontSize = "14px";
        div.style.display = activeLayer === "Flood Map" ? "block" : "none";
        div.innerHTML = `
<h4 style="color:black; margin-bottom:6px;">Legend</h4>
          <div style="display:flex; align-items:center; margin-bottom:4px;">
            <div style="width:16px; height:16px; background-color:green; margin-right:6px;"></div>Pre Flood
          </div>
          <div style="display:flex; align-items:center; margin-bottom:4px;">
            <div style="width:16px; height:16px; background-color:purple; margin-right:6px;"></div>Post Flood
          </div>
          <div style="display:flex; align-items:center;">
            <div style="width:16px; height:16px; background-color:gray; margin-right:6px;"></div>No Water
          </div>
        `;
        return div;
      },
    });

    const legend = new LegendControl({ position: "bottomright" });

    // Add the legend immediately
    if (mapRef.current) {
      mapRef.current.addControl(legend);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.removeControl(legend);
      }
    };
  }, [activeLayer]);

  return (
    <MapContainer
      center={[7.11, 79.92]}
      zoom={13}
      style={{ height: "600px", width: "100%" }}
      ref={mapRef as any}
    >
      <LayersControl position="topright">
        <BaseLayer name="Flood Map" checked={true}>
          <TileLayer
            url={floodMapUrl}
            attribution="NASA Earth Engine"
            eventHandlers={{ add: () => setActiveLayer("Flood Map") }}
          />
        </BaseLayer>
<BaseLayer name="Normal Map" checked={false}>
          <TileLayer
            url={normalMapUrl}
            attribution="&copy; OpenStreetMap contributors"
            eventHandlers={{ add: () => setActiveLayer("Normal Map") }}
          />
        </BaseLayer>

        <BaseLayer name="Raw SAR Data" checked={false}>
          <TileLayer
            url={rawDataUrl}
            attribution="NASA Earth Engine"
            eventHandlers={{ add: () => setActiveLayer("Raw SAR Data") }}
          />
        </BaseLayer>

        <BaseLayer name="Building 2016" checked={false}>
          <TileLayer
            url={building2016Url}
            attribution="NASA Earth Engine"
            eventHandlers={{ add: () => setActiveLayer("Building 2016") }}
          />
        </BaseLayer>

        <BaseLayer name="Building 2025" checked={false}>
          <TileLayer
            url={building2025Url}
            attribution="NASA Earth Engine"
            eventHandlers={{ add: () => setActiveLayer("Building 2025") }}
          />
        </BaseLayer>
      </LayersControl>
    </MapContainer>
  );
}
