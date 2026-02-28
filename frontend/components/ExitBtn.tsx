"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

export const ExitBtn = () => {
  return (
    <div className="p-4 border-t border-white/10 space-y-2">
      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all duration-200 font-medium cursor-pointer disabled:opacity-50">
        <LogOut className="w-5 h-5" />
        Вихід
      </button>
    </div>
  );
};
