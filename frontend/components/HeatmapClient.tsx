"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CountyStat {
  county: string;
  order_count: number;
  total_tax: number;
  lat: number;
  lon: number;
}

export default function HeatmapClient({ data }: { data: CountyStat[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      mapRef.current &&
      !mapInstance.current
    ) {
      mapInstance.current = L.map(mapRef.current).setView([42.7, -75.5], 7);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(mapInstance.current);

      setTimeout(() => {
        mapInstance.current?.invalidateSize();
      }, 100);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !data) return;

    const rawArray = Array.isArray(data) ? data : (data as any).data;
    if (!Array.isArray(rawArray) || rawArray.length === 0) return;

    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        mapInstance.current?.removeLayer(layer);
      }
    });

    const maxTax = Math.max(...rawArray.map((d) => d.total_tax));

    rawArray.forEach((point: CountyStat) => {
      if (!point.lat || !point.lon) return;

      const radius = 8 + (point.total_tax / maxTax) * 32;

      const circle = L.circleMarker([point.lat, point.lon], {
        radius: radius,
        fillColor: "#f59e0b",
        color: "#ffffff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.7,
      });

      circle.bindTooltip(
        `
        <div style="text-align: center; font-family: sans-serif; padding: 4px;">
          <strong style="font-size: 14px; color: #111827;">${point.county} County</strong><br/>
          <span style="color: #6B7280; font-size: 12px;">Замовлень: <b>${point.order_count}</b></span><br/>
          <span style="color: #f59e0b; font-size: 13px; font-weight: bold;">Податок: $${point.total_tax.toFixed(2)}</span>
        </div>
        `,
        {
          direction: "top",
          className: "custom-leaflet-tooltip",
          opacity: 0.95,
        },
      );

      circle.addTo(mapInstance.current!);
    });
  }, [data]);

  return (
    <div
      ref={mapRef}
      style={{
        minHeight: "600px",
        width: "100%",
        height: "100%",
        borderRadius: "1rem",
      }}
      className="z-0"
    />
  );
}
