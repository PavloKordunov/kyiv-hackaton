"use client";

import { useEffect, useState } from "react";
import { Loader2, Box, MapPin, MoreHorizontal, ArrowRight } from "lucide-react";
import getStatusBadge from "@/components/statusBadge";
import Link from "next/link";

const RecentActivity = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      setIsLoading(true);
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const response = await fetch(`${API_URL}/api/orders?page=1&limit=5`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Помилка сервера ${response.status}:`, errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data) {
          setOrders(result.data);
        }
      } catch (error) {
        console.error("Помилка завантаження останніх замовлень:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 overflow-hidden relative min-h-[300px]">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Остання активність (Замовлення)
        </h2>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 text-sm font-medium text-accentColor hover:text-accentColor/80 transition-colors"
        >
          Переглянути всі
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 top-[73px] bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accentColor animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          Замовлень поки немає.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Замовлення
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Округ
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Сума / Податок
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-white transition-colors">
                        <Box className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.id}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {order.timestamp?.slice(0, 16).replace("T", ", ")}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order?.jurisdictions?.[0] || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {order?.lat},{order?.lon}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      ${order.total_amount}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Податок: ${order.tax_amount}
                    </div>
                  </td>

                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>

                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-accentColor hover:bg-accentColor/10 rounded-lg transition-colors cursor-pointer">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
