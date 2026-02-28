"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Download, RefreshCw, Map, Filter, Loader2 } from "lucide-react";
import AdminHeader from "@/components/AdminHeader";

const HeatmapClient = dynamic(() => import("@/components/HeatmapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 text-accentColor animate-spin" />
    </div>
  ),
});

export default function HeatmapPage() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHeatmapData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/orders/heatmap");
      const data = await response.json();
      console.log("Отримані дані з бекенду: ", data);

      setHeatmapData(data);
    } catch (error) {
      console.error("Помилка завантаження даних для карти:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] w-full">
      <AdminHeader
        title="Теплова карта"
        subtitle="Географічний розподіл податкових надходжень"
      />

      <main className="flex-1 p-8 overflow-y-auto flex flex-col">
        {/* Панель керування */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Map className="w-5 h-5 text-accentColor" />
            <span>Відображено {heatmapData.length} округів</span>
          </div>
        </div>

        <div className="flex-1 min-h-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          {isLoading && heatmapData.length === 0 ? (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-accentColor animate-spin" />
            </div>
          ) : (
            <HeatmapClient data={heatmapData} />
          )}
        </div>
      </main>
    </div>
  );
}
