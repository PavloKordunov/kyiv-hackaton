import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { useState } from "react";

const ImportModal = ({ onClose }: { onClose: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      setError("Будь ласка, завантажте файл у форматі CSV.");
      return;
    }

    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Спочатку оберіть файл для завантаження.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${API_URL}/api/orders/import`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Не вдалося імпортувати дані. Спробуйте ще раз.");
      }

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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
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

        <h2 className="text-xl font-bold mb-2">Імпорт CSV</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Завантажте файл CSV для імпорту замовлень
        </p>

        <div className="relative w-full mb-4">
          {!file ? (
            <label
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                error
                  ? "border-red-400 bg-red-50 hover:bg-red-100"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud
                  className={`w-10 h-10 mb-2 ${
                    error ? "text-red-400" : "text-gray-400"
                  }`}
                />
                <p
                  className={`mb-1 text-sm font-semibold ${
                    error ? "text-red-500" : "text-gray-600"
                  }`}
                >
                  Натисніть або перетягніть
                </p>
                <p className="text-xs text-gray-400">CSV (до 5 МБ)</p>
              </div>

              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3 overflow-hidden">
                <FileText className="w-8 h-8 text-accentColor/70 shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} МБ
                  </span>
                </div>
              </div>
              <button
                onClick={clearFile}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="flex items-center justify-center w-full py-2 bg-accentColor/80 text-white rounded-lg hover:bg-accentColor/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Завантаження...
            </>
          ) : (
            "Завантажити"
          )}
        </button>
      </div>
    </div>
  );
};

export default ImportModal;
