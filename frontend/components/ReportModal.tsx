"use client";

import { X, Loader2, MapPin, Download } from "lucide-react";
import { useState } from "react";
import Select, { components } from "react-select";
import { counties } from "@/data/counties";

const countyOptions = counties.map((county) => ({
  value: county,
  label: county,
}));

const CustomControl = ({ children, ...props }: any) => (
  <components.Control {...props}>
    <div className="pl-3 pr-1 flex items-center text-gray-400">
      <MapPin className="w-4 h-4" />
    </div>
    {children}
  </components.Control>
);

const ReportModal = ({ onClose }: { onClose: () => void }) => {
  const [selectedCounties, setSelectedCounties] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      selectedCounties.forEach((county) => {
        params.append("county", county.value);
      });

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(
        `${API_URL}/api/orders/report/pdf?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("Не вдалося згенерувати звіт. Спробуйте ще раз.");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `wellness_report_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      onClose();
    } catch (err: any) {
      setError(err.message || "Сталася помилка при завантаженні.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={!isLoading ? onClose : undefined}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 disabled:opacity-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-2">Генерація PDF звіту</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Оберіть округи та проміжок часу. Якщо залишити порожнім, звіт буде
          згенеровано за весь час для всіх локацій.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Округи (Counties)
          </label>
          <Select
            isMulti
            options={countyOptions}
            value={selectedCounties}
            onChange={(selected: any) => setSelectedCounties(selected || [])}
            isSearchable
            placeholder="Всі округи"
            noOptionsMessage={() => "Округів не знайдено"}
            menuPlacement="bottom"
            maxMenuHeight={200}
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
                minHeight: "42px",
                "&:hover": { borderColor: "#D1D5DB" },
              }),
              menu: (base) => ({
                ...base,
                border: "1px solid #E5E7EB",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
                marginTop: "4px",
                zIndex: 9999,
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: "#F3F4F6",
                borderRadius: "0.375rem",
              }),
            }}
          />
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              З дати
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accentColor/20 focus:border-accentColor outline-none transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              По дату
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accentColor/20 focus:border-accentColor outline-none transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="flex items-center justify-center w-full py-2 bg-accentColor/80 text-white rounded-lg hover:bg-accentColor/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Генерація...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Завантажити звіт
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportModal;