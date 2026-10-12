"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/useUIStore";
import { CheckCircle2 } from "lucide-react";

export function ToastHost() {
  const message = useUIStore((s) => s.toastMessage);
  const clear = useUIStore((s) => s.clearToast);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(clear, 3200);
    return () => clearTimeout(t);
  }, [message, clear]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-[#081c16] px-4 py-3 text-sm font-medium text-white shadow-xl shadow-black/50">
      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      {message}
    </div>
  );
}
