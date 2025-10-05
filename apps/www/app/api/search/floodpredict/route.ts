import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const date = searchParams.get("date");

  if (!lat || !lon || !date) {
    return NextResponse.json({ error: "lat, lon, and date are required" }, { status: 400 });
  }

  try {
    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon, date }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error contacting backend:", error);
    return NextResponse.json({ error: "Python backend unreachable" }, { status: 500 });
  }
}
