"use client";

import type { ReactNode } from "react";
import { History, LayoutDashboard, TrendingUp, Truck } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/layout/Sidebar";

const NAV_ITEMS: NavItem[] = [
  { href: "/distributor", label: "Dashboard Pasokan", icon: LayoutDashboard },
  { href: "/distributor/input-distribusi", label: "Input Data Distribusi", icon: Truck },
  { href: "/distributor/tren-pasar", label: "Tren Permintaan & Proyeksi Pasar", icon: TrendingUp },
  { href: "/distributor/riwayat", label: "Riwayat Pengiriman", icon: History },
];

export default function DistributorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell-bg dash-shell flex min-h-screen text-slate-100">
      <Sidebar role="distributor" groupLabel="Distributor / Pelaku Usaha" items={NAV_ITEMS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}