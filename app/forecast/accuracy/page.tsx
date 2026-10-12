"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Target } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, Input, Badge, LoadingRows } from "@/components/ui/Basics";
import { useForecastResultsQuery, useKomoditasQuery, useWilayahQuery } from "@/hooks/useQueries";

export default function ForecastAccuracyPage() {
  const forecast = useForecastResultsQuery();
  const wilayah = useWilayahQuery();
  const komoditas = useKomoditasQuery();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const rows = useMemo(() => {
    const w = new Map((wilayah.data ?? []).map((x) => [x.id, x.nama_wilayah]));
    const k = new Map((komoditas.data ?? []).map((x) => [x.id, x.nama_komoditas]));
    return (forecast.data ?? [])
      .map((f) => ({
        ...f,
        wilayah: w.get(f.id_wilayah) ?? f.id_wilayah,
        komoditas: k.get(f.id_komoditas) ?? f.id_komoditas,
        versi: `FS-${new Date(f.createdAt).toISOString().slice(0, 10).replaceAll("-", "")}`,
      }))
      .filter((x) => `${x.wilayah} ${x.komoditas} ${x.versi}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [forecast.data, wilayah.data, komoditas.data, search]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  const avg = rows.length ? rows.reduce((a, r) => a + r.mape, 0) / rows.length : 0;

  return (
    <div className="app-shell-bg dash-shell min-h-screen text-slate-100">
      <TopBar title="Akurasi Model Forecasting" subtitle="MAPE per kombinasi wilayah-komoditas dan versi hasil model" />
      <div className="space-y-5 p-5 md:p-8">
        <Link href="/admin/model-ai" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Model AI
        </Link>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
            <p className="text-sm text-slate-400">Kombinasi dinilai</p>
            <p className="mt-2 text-2xl font-bold text-white">{rows.length}</p>
          </Card>
          <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
            <p className="text-sm text-slate-400">Rata-rata MAPE</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">{rows.length ? `${avg.toFixed(2)}%` : "—"}</p>
          </Card>
          <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
            <p className="flex items-center gap-2 text-sm text-slate-400"><Target className="h-4 w-4 text-emerald-400" /> Interpretasi</p>
            <p className="mt-2 text-xs text-slate-300">Semakin kecil MAPE, semakin kecil kesalahan persentase absolut.</p>
          </Card>
        </div>

        <Card padding="sm" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl flex items-center gap-3 p-4">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <Input 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Cari wilayah, komoditas, versi model…" 
            className="bg-[#051410] border-emerald-900/50 text-white placeholder:text-slate-600 border-0 focus:ring-0"
          />
        </Card>

        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                  <th className="p-4">Wilayah</th>
                  <th className="p-4">Komoditas</th>
                  <th className="p-4">MAPE</th>
                  <th className="p-4">Versi / ID hasil</th>
                  <th className="p-4">Tanggal forecast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {forecast.isLoading ? (
                  <tr><td colSpan={5} className="p-4"><LoadingRows /></td></tr>
                ) : (
                  visible.map((r) => (
                    <tr key={r.id} className="hover:bg-emerald-950/20 transition">
                      <td className="p-4 font-semibold text-slate-200">{r.wilayah}</td>
                      <td className="p-4 text-slate-300">{r.komoditas}</td>
                      <td className="p-4">
                        <Badge status={r.mape <= 10 ? "aman" : r.mape <= 20 ? "surplus" : "shortage"}>
                          {r.mape.toFixed(2)}%
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-300">
                        <span className="text-emerald-400 font-semibold">{r.versi}</span><br />
                        <span className="text-slate-500">{r.id}</span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">{new Date(r.createdAt).toLocaleString("id-ID")}</td>
                    </tr>
                  ))
                )}
                {!forecast.isLoading && !visible.length && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400">Belum ada hasil forecast untuk ditampilkan.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-emerald-900/30 p-4 text-xs text-slate-400 bg-emerald-950/10">
            <span>{rows.length} data · Halaman {page} dari {pages}</span>
            <div className="flex gap-2">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage((p) => p - 1)} 
                className="rounded-xl border border-emerald-900/50 bg-[#051410] px-3 py-1.5 text-slate-300 disabled:opacity-40 hover:bg-emerald-950 transition"
              >
                Sebelumnya
              </button>
              <button 
                disabled={page >= pages} 
                onClick={() => setPage((p) => p + 1)} 
                className="rounded-xl border border-emerald-900/50 bg-[#051410] px-3 py-1.5 text-slate-300 disabled:opacity-40 hover:bg-emerald-950 transition"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </Card>

        <p className="text-xs text-slate-400">Catatan: MAPE yang ditampilkan berasal dari hasil simulasi forecasting prototipe, bukan evaluasi terhadap aktual historis independen.</p>
      </div>
    </div>
  );
}