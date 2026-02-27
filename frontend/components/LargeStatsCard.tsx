import { LucideIcon } from "lucide-react";

interface LargeStatsCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
}

const LargeStatsCard = ({
  title,
  value,
  trend,
  icon: Icon,
}: LargeStatsCardProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <div className="mt-3">
            <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              {trend}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 bg-[#F3E8EB] rounded-2xl">
        <Icon className="w-8 h-8 text-[#8C2F48]" />
      </div>
    </div>
  );
};

export default LargeStatsCard;
