import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendColor?: "green" | "gray";
  // icon: LucideIcon; // Можна закоментувати або видалити
}

const StatsCard = ({
  title,
  value,
  trend,
  trendColor = "gray",
}: StatsCardProps) => {
  const trendBg = trendColor === "green" ? "bg-green-100" : "bg-gray-100";
  const trendText = trendColor === "green" ? "text-green-800" : "text-gray-800";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full min-h-[140px]">
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {value}
        </p>
      </div>

      {trend && (
        <div className="mt-4">
          <span
            className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${trendBg} ${trendText}`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;