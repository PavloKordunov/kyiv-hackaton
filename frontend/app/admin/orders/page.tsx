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
  MoreHorizontal,
  Box,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import { useEffect, useRef, useState } from "react";
import ImportModal from "@/components/ImportModal";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Select, { components } from "react-select";
import ReactPaginate from "react-paginate";
import { counties } from "@/data/counties";
import getStatusBadge from "@/components/statusBadge";
import FilterDateComponent from "@/components/FilterDateComponent";

const countyOptions = counties.map((county) => ({
  value: county,
  label: county,
}));

export default function OrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const countyParam = searchParams.get("county");
  const selectedCountiesFromUrl = countyParam ? countyParam.split(",") : [];

  const [localLimit, setLocalLimit] = useState(
    searchParams.get("limit") || "20",
  );

  const [orders, setOrders] = useState<any[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const queryString = searchParams.toString();

        const response = await fetch(
          `http://localhost:8080/api/orders?${queryString}`,
        );
        const result = await response.json();
        if (result.data) {
          setOrders(result.data);
          setMeta(result.meta);
        }
      } catch (error) {
        console.error("Помилка завантаження замовлень:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [searchParams]);

  const selectedOptions = countyOptions.filter((opt) =>
    selectedCountiesFromUrl.includes(opt.value),
  );

  const handleCountyChange = (selectedItems: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (selectedItems && selectedItems.length > 0) {
      const commaSeparatedString = selectedItems
        .map((item: any) => item.value)
        .join(",");
      params.set("county", commaSeparatedString);
    } else {
      params.delete("county");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const CustomControl = ({ children, ...props }: any) => (
    <components.Control {...props}>
      <div className="pl-3 pr-1 flex items-center text-gray-400">
        <MapPin className="w-4 h-4" />
      </div>
      {children}
    </components.Control>
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    setLocalLimit(searchParams.get("limit") || "20");
  }, [searchParams]);

  const applyLimit = (value: string) => {
    let newLimit = parseInt(value, 10);

    if (isNaN(newLimit) || newLimit < 1) newLimit = 10;
    if (newLimit > 500) newLimit = 500;

    setLocalLimit(newLimit.toString());

    const params = new URLSearchParams(searchParams.toString());

    if (params.get("limit") === newLimit.toString()) return;

    params.set("limit", newLimit.toString());
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const closeModal = () => setIsModalOpen(false);

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

          <div className="w-full sm:w-[300px] z-10">
            <Select
              isMulti
              options={countyOptions}
              value={selectedOptions}
              onChange={handleCountyChange}
              isSearchable
              placeholder="Всі округи (Counties)"
              noOptionsMessage={() => "Округів не знайдено"}
              menuPlacement="bottom"
              maxMenuHeight={250}
              className="react-select-container"
              classNamePrefix="react-select"
              components={{
                Control: CustomControl,
                IndicatorSeparator: () => null,
                Option: ({ innerRef, innerProps, data, isFocused }: any) => (
                  <div
                    ref={innerRef}
                    {...innerProps}
                    className={`px-4 py-2 text-sm ${
                      isFocused ? "bg-accentColor/10" : "bg-white"
                    } hover:bg-accentColor/10 cursor-pointer transition-colors`}
                  >
                    <p className="font-medium text-gray-700">{data.label}</p>
                  </div>
                ),
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#E5E7EB",
                  borderRadius: "0.5rem",
                  boxShadow: "none",
                  minHeight: "36px",
                  backgroundColor: "white",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "#D1D5DB",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.75rem",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  overflow: "hidden",
                  marginTop: "4px",
                }),
                menuList: (base) => ({
                  ...base,
                  maxHeight: "250px",
                  padding: "4px 0",
                }),
                input: (base) => ({
                  ...base,
                  fontSize: "0.875rem",
                  margin: 0,
                  padding: 0,
                }),
                placeholder: (base) => ({
                  ...base,
                  fontSize: "0.875rem",
                  color: "#4B5563",
                  marginLeft: "4px",
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#F3F4F6",
                  borderRadius: "0.375rem",
                  margin: "2px 4px 2px 0",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#374151",
                  fontSize: "0.75rem",
                  padding: "2px 6px",
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: "#9CA3AF",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#E5E7EB",
                    color: "#ef4444",
                  },
                }),
              }}
            />
          </div>

          <FilterDateComponent />

          <button
            onClick={() => router.push("?")}
            className="cursor-pointer px-3 py-1.5 text-accentColor/80 hover:text-accentColor/90 text-sm font-medium ml-auto transition-colors"
          >
            Скинути фільтри
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-60 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-accentColor animate-spin" />
            </div>
          )}
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
                            {order.timestamp.slice(0, 16).replace("T", ", ")}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order?.jurisdictions[0]}
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

                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>

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

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <span className="text-sm text-gray-500">
              Показано сторінку <strong>{meta.page}</strong> з{" "}
              <strong>{meta.totalPages}</strong> (Всього: {meta.total}{" "}
              замовлень)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Показувати по:</span>
              <input
                type="number"
                min="1"
                max="500"
                value={localLimit}
                onChange={(e) => setLocalLimit(e.target.value)}
                onBlur={(e) => applyLimit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyLimit(localLimit);
                    e.currentTarget.blur();
                  }
                }}
                disabled={isLoading}
                className="w-16 text-sm border border-gray-200 rounded-lg px-2 py-1 text-center text-gray-700 focus:ring-2 focus:ring-accentColor/20 focus:border-accentColor outline-none disabled:opacity-50 transition-colors bg-white"
                title="Натисніть Enter для застосування"
              />
            </div>
            <ReactPaginate
              pageCount={meta.totalPages}
              forcePage={meta.page - 1}
              onPageChange={(event: any) =>
                handlePageChange(event.selected + 1)
              }
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              breakLabel={<MoreHorizontal className="w-4 h-4 text-gray-400" />}
              previousLabel={
                <div className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Попередня</span>
                </div>
              }
              nextLabel={
                <div className="flex items-center gap-1">
                  <span className="hidden sm:inline">Наступна</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              }
              containerClassName="flex items-center gap-1"
              pageLinkClassName="w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100 border border-transparent cursor-pointer"
              activeLinkClassName="!bg-accentColor/10 !text-accentColor !border-accentColor/20"
              breakClassName="flex items-center justify-center w-9 h-9"
              previousLinkClassName="flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] text-sm border border-transparent rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer mr-2"
              nextLinkClassName="flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] text-sm border border-transparent rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer ml-2"
              disabledClassName="opacity-50 pointer-events-none"
            />
          </div>
        </div>
      </main>
      {isModalOpen && <ImportModal onClose={closeModal} />}
    </div>
  );
}
