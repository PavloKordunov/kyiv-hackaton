"use client";

import {
  UploadCloud,
  Plus,
  Download,
  Search,
  Filter,
  Calendar,
  MapPin,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import { useState } from "react";
import ImportModal from "@/components/ImportModal";

export default function OrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] w-full">
      <AdminHeader
        title="Замовлення"
        subtitle="Управління доставками та розрахунок податків"
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Пошук за ID або координатами..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accentColor/80 shadow-sm text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm">
              <Download className="w-4 h-4" />
              <span>Звіт PDF</span>
            </button>
            <button className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm">
              <Plus className="w-4 h-4" />
              <span>Нове замовлення</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-accentColor/80 text-white hover:bg-accentColor/90 shadow-sm font-medium transition-colors text-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Імпорт CSV</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mr-2">
            <Filter className="w-4 h-4" />
            Фільтри:
          </div>

          <button className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm transition-colors">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>За весь час</span>
            <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
          </button>

          <button className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm transition-colors">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>Всі округи (Counties)</span>
            <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
          </button>

          <button className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm transition-colors">
            <AlertCircle className="w-4 h-4 text-gray-400" />
            <span>Статус: Всі</span>
            <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
          </button>

          <button className="cursor-pointer px-3 py-1.5 text-accentColor/80 hover:text-accentColor/90 text-sm font-medium ml-auto transition-colors">
            Скинути фільтри
          </button>
        </div>
      </main>
      {isModalOpen && <ImportModal onClose={closeModal} />}
    </div>
  );
}
