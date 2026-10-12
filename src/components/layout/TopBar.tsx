"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { useUIStore } from "@/store/useUIStore";
import { useSessionStore } from "@/store/useSessionStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function initials(nama: string) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const session = useSessionStore((s) => s.session);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = useDataStore((s) => s.notifikasi);
  const unreadCount = notifications.filter((n) => n.tindak_lanjut === "menunggu_tindak_lanjut").length;

  return (
    <header className="flex items-center justify-between sticky top-0 z-20 border-b border-emerald-900/30 bg-[#051410]/80 px-5 py-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-lg border border-emerald-900/40 p-1.5 text-slate-300 hover:bg-white/5 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="glow-text text-lg font-extrabold tracking-tight md:text-xl">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 md:text-sm">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
      <ThemeToggle />
      {session && (
        <>
          <div className="relative">
            <button type="button" onClick={() => setShowNotifications(v => !v)} aria-label="Buka notifikasi" className="relative rounded-xl border border-emerald-900/50 bg-white/[0.03] p-2 text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-300">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </button>
            {showNotifications && <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-emerald-900/50 bg-[#081c16] p-3 shadow-2xl shadow-black/60">
              <div className="mb-2 flex items-center justify-between"><span className="font-semibold text-white">Peringatan belum ditindaklanjuti</span><span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs text-rose-300">{unreadCount}</span></div>
              {notifications.filter(n => n.tindak_lanjut === "menunggu_tindak_lanjut").slice(0,3).map(n => <div key={n.id} className="border-t border-emerald-900/30 py-2 text-xs text-slate-400"><p className="font-medium text-slate-100">{n.status.toUpperCase()} · {n.id_komoditas}</p><p>{n.pesan}</p></div>)}
              {unreadCount === 0 && <p className="py-3 text-xs text-slate-400">Tidak ada peringatan baru.</p>}
              <Link onClick={() => setShowNotifications(false)} href={session.role === "admin" ? "/admin/notifikasi" : "/bulog/notifikasi"} className="mt-2 block rounded-lg bg-emerald-500/15 px-3 py-2 text-center text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25">Lihat semua notifikasi</Link>
            </div>}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">{session.nama}</p>
            <p className="text-xs text-slate-500">{session.instansi}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-emerald-950 shadow-sm">
            {initials(session.nama)}
          </span>
        </>
      )}
      </div>
    </header>
  );
}
