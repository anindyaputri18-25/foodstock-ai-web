"use client";

import type { ReactNode } from "react";
import { ClipboardList, FileDown, History, LayoutDashboard, MapPinned, Shuffle, TrendingUp } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/layout/Sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/dinas", label: "Dashboard Monitoring", icon: LayoutDashboard },
  { href: "/dinas/forecasting", label: "Proyeksi Forecasting AI", icon: TrendingUp },
  { href: "/dinas/realokasi", label: "Rekomendasi Realokasi", icon: Shuffle },
  { href: "/dinas/evaluasi-wilayah", label: "Detail Evaluasi Wilayah", icon: MapPinned },
  { href: "/dinas/input-stok", label: "Input Stok & Konsumsi", icon: ClipboardList },
  { href: "/dinas/laporan", label: "Laporan & Ekspor Data", icon: FileDown },
  { href: "/dinas/riwayat", label: "Riwayat & Log Notifikasi", icon: History },
];

export default function DinasLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell-bg dash-shell flex min-h-screen text-slate-100">
      <Sidebar role="dinas" groupLabel="Dinas Ketahanan Pangan" items={NAV_ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}