"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  UploadCloud,
  FileText,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { ExitBtn } from "./ExitBtn";

const navItems = [
  { title: "Дашборд", url: "/admin", icon: LayoutDashboard },
  { title: "Замовлення", url: "/admin/orders", icon: ClipboardList },
  { title: "Теплова карта", url: "/admin/heatmap", icon: MapPin },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-accentColor text-white flex flex-col shadow-xl z-50">
      <div className="flex items-center justify-between w-full p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-30 h-10 rounded-full flex items-center justify-center shrink-0">
            <Image
              src="/logoFooter.svg"
              alt="Logo Icon"
              unoptimized
              width={80}
              height={60}
              className="object-contain"
            />
          </div>

          {/* <div className="relative h-8 w-[80px]">
                        <Image
                            src="/logo3.svg"
                            alt="Mollis Name"
                            unoptimized
                            fill
                            className="object-contain object-left"
                        />
                    </div> */}
        </div>
        <p className="text-[10px] font-medium text-white/50 text-right leading-tight  tracking-wider">
          Адмін панель
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            item.url === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.url);

          return (
            <Link
              key={item.url}
              href={item.url}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive ? "text-white" : "text-white/70"
                }`}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <ExitBtn />
    </aside>
  );
};

export default AdminSidebar;
