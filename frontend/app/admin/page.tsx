"use client";

import {
  Package,
  BadgeDollarSign,
  MapPin,
  Navigation,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import LargeStatsCard from "@/components/LargeStatsCard";
import RecentActivity from "@/components/RecentActivity";
import StatsCard from "@/components/StatsCard";

const activities = [
  {
    id: 1,
    text: "Успішно імпортовано CSV (450 замовлень)",
    time: "2 хв тому",
    type: "system" as const,
  },
  {
    id: 2,
    text: "Виявлено нову податкову зону (Erie County)",
    time: "15 хв тому",
    type: "tax" as const,
  },
  {
    id: 3,
    text: "Дрон #D-402 завершив доставку (Lat: 40.71, Lon: -74.00)",
    time: "32 хв тому",
    type: "order" as const,
  },
  {
    id: 4,
    text: "Помилка валідації координат у замовленні #ORD-892",
    time: "1 год тому",
    type: "alert" as const,
  },
];

export default function AdminPage() {
  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] w-full">
      <AdminHeader
        title="Операційний центр"
        subtitle="Моніторинг доставок та податків (NY State)"
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            icon={Package}
            title="Всього замовлень"
            value="1,248"
            trend="+124 після імпорту"
            trendColor="green"
          />
          <StatsCard
            icon={BadgeDollarSign}
            title="Зібрано податків"
            value="$4,250.80"
            trend="Composite Tax"
            trendColor="gray"
          />
          <StatsCard
            icon={MapPin}
            title="Податкових зон"
            value="14"
            trend="NY State"
            trendColor="gray"
          />
          <StatsCard
            icon={Navigation}
            title="Дронів у повітрі"
            value="42"
            trend="Оптимальне навантаження"
            trendColor="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LargeStatsCard
            icon={TrendingUp}
            title="Ефективна податкова ставка (Середня)"
            value="8.875%"
            trend="Округ Нью-Йорк"
          />
          <LargeStatsCard
            icon={AlertCircle}
            title="Проблемні транзакції"
            value="3"
            trend="Потребують ручної перевірки"
          />
        </div>

        <RecentActivity />
      </main>
    </div>
  );
}
