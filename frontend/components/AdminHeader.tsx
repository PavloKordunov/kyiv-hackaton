import { Search, Bell, User } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
}

const AdminHeader = ({ title, subtitle }: AdminHeaderProps) => {
  return (
    <header className="bg-white h-[100px] w-full px-8 border-b border-gray-100 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-3xl font-medium text-[#1F2937] tracking-tight">
          {title}
        </h2>
        <p className="text-accentColor mt-1 text-sm font-medium">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 pl-2">
        <div className="w-10 h-10 rounded-full bg-accentColor flex items-center justify-center text-white shadow-sm shrink-0">
          <User size={20} />
        </div>

        <div className="hidden lg:block text-right">
          <p className="text-sm font-bold text-[#1F2937] leading-none">
            Адміністратор
          </p>
          <p className="text-xs text-[#6B7280] mt-1">admin@better.me</p>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
