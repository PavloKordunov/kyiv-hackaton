interface ActivityItem {
  id: number;
  text: string;
  time: string;
  type: "system" | "tax" | "alert" | "order";
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity = ({ activities }: RecentActivityProps) => {
  const getDotColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "order":
        return "bg-[#8C2F48]";
      case "tax":
        return "bg-yellow-400";
      case "system":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Остання активність
      </h2>
      <div className="space-y-1">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`flex items-center justify-between py-4 ${
              index !== activities.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-2 h-2 rounded-full ${getDotColor(activity.type)}`}
              ></div>
              <p className="text-sm text-gray-700">{activity.text}</p>
            </div>
            <span className="text-xs text-gray-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
