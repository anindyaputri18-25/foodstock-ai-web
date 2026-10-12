"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Basics";
import { useDataStore } from "@/store/useDataStore";

export default function PetaWilayahPage() {
  const wilayah = useDataStore((s) => s.wilayah);
  const forecast = useDataStore((s) => s.forecastResults);
  const [selected, setSelected] = useState("");

  const rows = wilayah.map((w) => {
    const fs = forecast.filter((f) => f.id_wilayah === w.id);
    const status = fs.some((f) => f.status === "shortage") ? "shortage" : fs.some((f) => f.status === "surplus") ? "surplus" : "aman";
    return { ...w, status, count: fs.length };
  });

  const focus = rows.find((w) => w.id === selected) ?? rows[0];

  return (
    <>
      <TopBar title="Peta Interaktif Wilayah" subtitle="Status ketersediaan pangan per wilayah berdasarkan hasil forecast" />
      <div className="grid gap-5 p-5 md:p-8 lg:grid-cols-[1.3fr_1fr]">
        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden flex flex-col">
          <div className="border-b border-emerald-900/30 p-4">
            <h2 className="font-bold text-white">Peta wilayah</h2>
            <p className="text-xs text-slate-400">Pilih wilayah untuk melihat lokasinya.</p>
          </div>
          {focus ? (
            <iframe title="Peta OpenStreetMap" className="h-[420px] w-full rounded-b-2xl opacity-80 hover:opacity-100 transition" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${focus.longitude - 2}%2C${focus.latitude - 1.5}%2C${focus.longitude + 2}%2C${focus.latitude + 1.5}&layer=mapnik&marker=${focus.latitude}%2C${focus.longitude}`} />
          ) : (
            <p className="p-8 text-slate-400">Belum ada data wilayah.</p>
          )}
        </Card>

        <Card className="agri-card p-6 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl">
          <h2 className="mb-3 font-bold text-white">Legenda status</h2>
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-emerald-300 font-semibold">Aman</span>
            <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-rose-300 font-semibold">Shortage</span>
            <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-amber-300 font-semibold">Surplus</span>
          </div>
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {rows.map((w) => (
              <button 
                key={w.id} 
                onClick={() => setSelected(w.id)} 
                className={`w-full rounded-xl border p-3 text-left transition ${focus?.id === w.id ? "border-emerald-500 bg-emerald-950/40 shadow-md shadow-emerald-950/50" : "border-emerald-900/40 bg-[#051410]/60 hover:bg-emerald-950/20"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200">{w.nama_wilayah}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${w.status === "shortage" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : w.status === "surplus" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>{w.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{w.latitude}, {w.longitude} · {w.count} hasil forecast</p>
              </button>
            ))}
          </div>
          {focus && (
            <a className="mt-4 inline-block text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${focus.latitude}&mlon=${focus.longitude}#map=7/${focus.latitude}/${focus.longitude}`}>
              Buka peta ukuran penuh ↗
            </a>
          )}
        </Card>
      </div>
    </>
  );
}