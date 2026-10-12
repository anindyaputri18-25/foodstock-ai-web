"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, LogOut, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useUIStore } from "@/store/useUIStore";
import { useLogout } from "@/hooks/useAuth";
import { useSessionStore } from "@/store/useSessionStore";
import { ROLE_LABEL, type Role } from "@/types/domain";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ICON_TONES = [
  "text-emerald-400", "text-sky-400", "text-amber-400", "text-violet-400",
  "text-rose-400", "text-teal-400", "text-lime-400", "text-fuchsia-400", "text-cyan-400", "text-orange-400",
];

function initials(nama: string) {
  return nama.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function Sidebar({ role, groupLabel, items }: { role: Role; groupLabel: string; items: NavItem[] }) {
  const pathname = usePathname();
  const isOpen = useUIStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const logout = useLogout();
  const session = useSessionStore((s) => s.session);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col overflow-hidden border-r border-emerald-900/30 bg-[#061a14] transition-transform lg:sticky lg:top-0 lg:translate-x-0 lg:self-start ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative flex items-center justify-between px-5 pb-4 pt-6">
          <Logo />
          <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mx-4 mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/80">Workspace</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-white">{groupLabel}</p>
        </div>

        <p className="relative px-6 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Navigasi</p>
        <nav className="relative flex-1 space-y-1 overflow-y-auto px-4 pb-4">
          {items.map((item, idx) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-emerald-950 shadow-lg shadow-emerald-900/40"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-emerald-950" : ICON_TONES[idx % ICON_TONES.length]}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative border-t border-emerald-900/30 p-4">
          {session && (
            <Link href="/profil" className="group mb-2 flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-bold text-emerald-950 shadow-md">
                {initials(session.nama)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{session.nama}</span>
                <span className="block truncate text-[11px] text-emerald-400">{ROLE_LABEL[role]}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-emerald-400 opacity-0 transition group-hover:opacity-100" />
            </Link>
          )}
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-rose-300 transition hover:bg-rose-500/10">
            <LogOut className="h-[18px] w-[18px]" /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
