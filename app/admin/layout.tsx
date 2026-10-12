"use client";

import type { ReactNode } from "react";
import {
  BellRing, GitCompare, HeartPulse, LayoutDashboard, MapPinned,
  ScrollText, Settings2, ShieldQuestion, UsersRound, History,
} from "lucide-react";
import { Sidebar, type NavItem } from "@/components/layout/Sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard Admin", icon: LayoutDashboard },
  { href: "/admin/pengguna", label: "Kelola Pengguna", icon: UsersRound },
  { href: "/admin/master-data", label: "Master Data", icon: ShieldQuestion },
  { href: "/admin/model-ai", label: "Pengaturan Model AI", icon: Settings2 },
  { href: "/forecast/accuracy", label: "Akurasi Forecast", icon: BellRing },
  { href: "/admin/notifikasi", label: "Riwayat Notifikasi", icon: History },
  { href: "/admin/audit-log", label: "Audit Log Aktivitas", icon: ScrollText },
  { href: "/admin/peta-wilayah", label: "Peta Status Wilayah", icon: MapPinned },
  { href: "/admin/perbandingan-forecast", label: "Forecast vs Aktual", icon: GitCompare },
  { href: "/admin/health", label: "Kesehatan Sistem", icon: HeartPulse },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell-bg dash-shell flex min-h-screen text-slate-100">
      <Sidebar role="admin" groupLabel="Administrator" items={NAV_ITEMS} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
