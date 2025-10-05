// File: apps/www/components/TileLayers.ts

export const normalMap = {
  url: "https://{s}.tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png",
  attribution: "© OpenStreetMap contributors"
};

export const preFloodMap = {
  url: "https://earthengine.googleapis.com/v1/projects/nasa-app-25-sar/maps/<PRE_FLOOD_MAP_ID>/tiles/{z}/{x}/{y}",
  attribution: "NASA SAR Pre-Flood"
};

export const postFloodMap = {
  url: "https://earthengine.googleapis.com/v1/projects/nasa-app-25-sar/maps/<POST_FLOOD_MAP_ID>/tiles/{z}/{x}/{y}",
  attribution: "NASA SAR Post-Flood"
};
