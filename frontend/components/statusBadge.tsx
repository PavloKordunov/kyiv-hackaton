import { AlertCircle, CheckCircle2 } from "lucide-react";

const getStatusBadge = (status: boolean) => {
  switch (status) {
    case true:
      return (
        <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Прийнято
        </span>
      );
    case false:
      return (
        <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
          <AlertCircle className="w-3.5 h-3.5" />
          Відхилено
        </span>
      );
    default:
      return null;
  }
};

export default getStatusBadge;
