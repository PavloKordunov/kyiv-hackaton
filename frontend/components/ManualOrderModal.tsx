"use client";

import { X, Loader2, Plus, MapPin, DollarSign } from "lucide-react";
import { useState } from "react";

const ManualOrderModal = ({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Базова валідація
    if (!lat || !lon || !subtotal) {
      setError("Будь ласка, заповніть усі поля.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          subtotal: parseFloat(subtotal),
        }),
      });

      if (!res.ok) {
        throw new Error("Не вдалося створити замовлення. Перевірте введені дані.");
      }

      onSuccess(); // Викликаємо колбек для оновлення таблиці
      onClose();   // Закриваємо модалку
    } catch (err: any) {
      setError(err.message || "Сталася помилка при збереженні.");
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

        <h2 className="text-xl font-bold mb-2">Нове замовлення</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Введіть координати доставки та суму замовлення (без податків). Система автоматично визначить юрисдикцію та нарахує податок.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Широта (Latitude)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="any"
                  placeholder="40.7128"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accentColor/20 focus:border-accentColor outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Довгота (Longitude)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="any"
                  placeholder="-74.0060"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accentColor/20 focus:border-accentColor outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Сума замовлення (Subtotal)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accentColor/20 focus:border-accentColor outline-none transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !lat || !lon || !subtotal}
            className="flex items-center justify-center w-full py-2 bg-accentColor/80 text-white rounded-lg hover:bg-accentColor/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Збереження...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Створити замовлення
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManualOrderModal;