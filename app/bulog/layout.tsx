"use client";

import type { ReactNode } from "react";
import { Bell, FileDown, LayoutDashboard, PackagePlus, Shuffle } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/layout/Sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/bulog", label: "Dashboard Logistik & Gudang", icon: LayoutDashboard },
  { href: "/bulog/input-stok", label: "Input & Update Stok Gudang", icon: PackagePlus },
  { href: "/bulog/notifikasi", label: "Notifikasi Early Warning", icon: Bell },
  { href: "/bulog/realokasi", label: "Rencana Realokasi Logistik", icon: Shuffle },
  { href: "/bulog/laporan", label: "Rekapitulasi & Laporan Gudang", icon: FileDown },
];

export default function BulogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell-bg dash-shell flex min-h-screen text-slate-100">
      <Sidebar role="bulog" groupLabel="Bulog / Badan Pangan Nasional" items={NAV_ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}