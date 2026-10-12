"use client";

import type { StatusProyeksi } from "@/types/domain";

const STATUS_STYLE: Record<StatusProyeksi, string> = {
  aman: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20",
  shortage: "bg-rose-500/10 text-rose-300 border-rose-500/25 hover:bg-rose-500/20",
  surplus: "bg-sky-500/10 text-sky-300 border-sky-500/25 hover:bg-sky-500/20",
};

const STATUS_DOT: Record<StatusProyeksi, string> = {
  aman: "bg-emerald-500",
  shortage: "bg-rose-500",
  surplus: "bg-sky-500",
};

export interface StatusGridItem {
  id: string;
  label: string;
  ratio: number; // rasio ketersediaan / kebutuhan
  status: StatusProyeksi;
}

export function StatusGrid({ items, onSelect }: { items: StatusGridItem[]; onSelect?: (id: string) => void }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">Belum ada data untuk filter ini.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect?.(item.id)}
          className={`rounded-xl border px-3 py-2.5 text-left text-xs transition ${STATUS_STYLE[item.status]}`}
        >
          <div className="font-semibold leading-tight">{item.label}</div>
          <div className="mt-1 text-sm font-bold">{item.ratio.toFixed(2)}x</div>
        </button>
      ))}
    </div>
  );
}

export function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
      {(["aman", "shortage", "surplus"] as StatusProyeksi[]).map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[s]}`} />
          {s === "aman" ? "Aman" : s === "shortage" ? "Defisit" : "Surplus"}
        </span>
      ))}
    </div>
  );
}
