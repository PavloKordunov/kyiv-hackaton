"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const FilterDateComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [localFrom, setLocalFrom] = useState(
    searchParams.get("fromDate") || "",
  );
  const [localTo, setLocalTo] = useState(searchParams.get("toDate") || "");
  const applyDates = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (localFrom) params.set("fromDate", localFrom);
    else params.delete("fromDate");

    if (localTo) params.set("toDate", localTo);
    else params.delete("toDate");

    router.push(`?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  const clearDates = () => {
    setLocalFrom("");
    setLocalTo("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("fromDate");
    params.delete("toDate");
    router.push(`?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const urlFrom = searchParams.get("fromDate");
  const urlTo = searchParams.get("toDate");

  let buttonText = "За весь час";
  if (urlFrom && urlTo)
    buttonText = `${formatDate(urlFrom)} - ${formatDate(urlTo)}`;
  else if (urlFrom) buttonText = `З ${formatDate(urlFrom)}`;
  else if (urlTo) buttonText = `До ${formatDate(urlTo)}`;
  useEffect(() => {
    setLocalFrom(searchParams.get("fromDate") || "");
    setLocalTo(searchParams.get("toDate") || "");
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative z-20" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-sm ${
          urlFrom || urlTo
            ? "border-accentColor/50 bg-accentColor/5 text-accentColor"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Calendar
          className={`w-4 h-4 ${urlFrom || urlTo ? "text-accentColor" : "text-gray-400"}`}
        />
        <span className="font-medium">{buttonText}</span>

        {urlFrom || urlTo ? (
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              clearDates();
            }}
            className="p-0.5 hover:bg-accentColor/20 rounded-md ml-1"
          >
            <X className="w-3 h-3 text-accentColor" />
          </div>
        ) : (
          <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-xl p-4 w-[320px] z-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Виберіть період
          </h4>

          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                Початкова дата
              </label>
              <input
                type="date"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accentColor/20 focus:border-accentColor outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                Кінцева дата
              </label>
              <input
                type="date"
                value={localTo}
                min={localFrom}
                onChange={(e) => setLocalTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accentColor/20 focus:border-accentColor outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={clearDates}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              Скинути
            </button>
            <button
              onClick={applyDates}
              className="px-4 py-1.5 text-sm text-white bg-accentColor/90 hover:bg-accentColor rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Застосувати
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default FilterDateComponent;
