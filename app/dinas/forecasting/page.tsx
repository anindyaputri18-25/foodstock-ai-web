"use client";

import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Button, Card, LoadingRows, Select } from "@/components/ui/Basics";
import { LineChart, LineChartLegend } from "@/components/charts/LineChart";
import { useForecastResultsQuery, useForecastSeriesQuery, useKomoditasQuery, useWilayahQuery } from "@/hooks/useQueries";
import { useRunForecastMutation } from "@/hooks/useMutations";
import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";

export default function ForecastingPage() {
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const forecastResultsQuery = useForecastResultsQuery();
  const runForecast = useRunForecastMutation();
  const session = useSessionStore((s) => s.session);
  const showToast = useUIStore((s) => s.showToast);

  const wilayahList = wilayahQuery.data ?? [];
  const komoditasList = komoditasQuery.data ?? [];

  const [idWilayah, setIdWilayah] = useState("");
  const [idKomoditas, setIdKomoditas] = useState("");
  const [horizon, setHorizon] = useState(14);

  const activeWilayah = idWilayah || wilayahList[0]?.id || "";
  const activeKomoditas = idKomoditas || komoditasList[0]?.id || "";

  const seriesQuery = useForecastSeriesQuery(activeWilayah, activeKomoditas);
  const currentResult = (forecastResultsQuery.data ?? []).find((r) => r.id_wilayah === activeWilayah && r.id_komoditas === activeKomoditas);

  const w = wilayahList.find((x) => x.id === activeWilayah);
  const k = komoditasList.find((x) => x.id === activeKomoditas);
  const series = (seriesQuery.data ?? []).slice(0, horizon);

  return (
    <>
      <TopBar title="Forecasting Stok Pangan" subtitle="Proyeksi kebutuhan & ketersediaan pangan berbasis model time-series" />
      <div className="space-y-6 p-5 md:p-8 text-slate-100">
        <Card padding="sm" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl flex flex-wrap items-end gap-4 p-4">
          <label className="text-xs font-semibold text-slate-400">
            Wilayah
            <Select className="mt-1 w-48 bg-[#051410] border-emerald-900/50 text-white" value={activeWilayah} onChange={(e) => setIdWilayah(e.target.value)}>
              {wilayahList.map((w) => <option key={w.id} value={w.id}>{w.nama_wilayah}</option>)}
            </Select>
          </label>
          <label className="text-xs font-semibold text-slate-400">
            Komoditas
            <Select className="mt-1 w-48 bg-[#051410] border-emerald-900/50 text-white" value={activeKomoditas} onChange={(e) => setIdKomoditas(e.target.value)}>
              {komoditasList.map((k) => <option key={k.id} value={k.id}>{k.nama_komoditas}</option>)}
            </Select>
          </label>
          <label className="text-xs font-semibold text-slate-400">
            Horizon Proyeksi
            <Select className="mt-1 w-40 bg-[#051410] border-emerald-900/50 text-white" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}>
              <option value={7}>7 Hari ke Depan</option>
              <option value={14}>14 Hari ke Depan</option>
              <option value={30}>30 Hari ke Depan</option>
            </Select>
          </label>
          <Button
            className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/50"
            loading={runForecast.isPending}
            onClick={() =>
              runForecast.mutate({ nama: session?.nama ?? "Dinas", role: "dinas" }, { onSuccess: () => showToast("Model forecasting selesai dijalankan ulang.") })
            }
          >
            <RefreshCcw className="h-4 w-4" /> {runForecast.isPending ? "Memproses Model…" : "Jalankan Ulang Model"}
          </Button>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
            <p className="text-xs text-slate-400">Akurasi Model (MAPE)</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{runForecast.isPending ? "…" : currentResult ? `${currentResult.mape.toFixed(1)}%` : "-"}</p>
            <p className="text-xs text-slate-400 mt-1">Dievaluasi dari data historis 90 hari</p>
          </Card>
          <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
            <p className="text-xs text-slate-400">Terakhir Dijalankan</p>
            <p className="mt-1 text-base font-bold text-white">{runForecast.isPending ? "Memproses…" : currentResult ? new Date(currentResult.createdAt).toLocaleString("id-ID") : "-"}</p>
            <p className="text-xs text-slate-400 mt-1">Dijalankan manual oleh Petugas Dinas</p>
          </Card>
          <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
            <p className="text-xs text-slate-400">Status Model</p>
            <p className="mt-1 text-lg font-bold text-emerald-400">{runForecast.isPending ? "Memproses…" : "Aktif"}</p>
            <p className="text-xs text-slate-400 mt-1">Time-series forecasting on-demand</p>
          </Card>
        </div>

        <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
          <h2 className="mb-1 font-bold text-white">Proyeksi Stok vs Kebutuhan</h2>
          <p className="mb-4 text-xs text-slate-400">{w?.nama_wilayah} · {k?.nama_komoditas}</p>
          {seriesQuery.isLoading || runForecast.isPending ? (
            <div className="h-56 animate-pulse rounded-xl bg-emerald-950/30 border border-emerald-900/30" />
          ) : (
            <>
              <LineChart
                labels={series.map((p) => p.tanggal.slice(5))}
                series={[
                  { label: "Proyeksi Stok", color: "#10b981", values: series.map((p) => p.proyeksi_ketersediaan) },
                  { label: "Proyeksi Kebutuhan", color: "#f43f5e", values: series.map((p) => p.proyeksi_kebutuhan) },
                ]}
              />
              <div className="mt-4">
                <LineChartLegend series={[{ label: "Proyeksi Stok", color: "#10b981", values: [] }, { label: "Proyeksi Kebutuhan", color: "#f43f5e", values: [] }]} />
              </div>
            </>
          )}
        </Card>

        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <h2 className="p-5 pb-0 font-bold text-white">Detail Proyeksi Harian</h2>
          <div className="overflow-x-auto p-5">
            {seriesQuery.isLoading ? (
              <LoadingRows />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                    <th className="pb-3 pr-4">Tanggal</th>
                    <th className="pb-3 pr-4">Proyeksi Stok</th>
                    <th className="pb-3 pr-4">Proyeksi Kebutuhan</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20">
                  {series.map((p) => (
                    <tr key={p.tanggal} className="hover:bg-emerald-950/20 transition">
                      <td className="py-3 pr-4 text-xs text-slate-400">{p.tanggal}</td>
                      <td className="py-3 pr-4 font-semibold text-emerald-400">{p.proyeksi_ketersediaan.toLocaleString("id-ID")}</td>
                      <td className="py-3 pr-4 text-slate-300">{p.proyeksi_kebutuhan.toLocaleString("id-ID")}</td>
                      <td className="py-3"><Badge status={p.status}>{p.status === "aman" ? "Aman" : p.status === "shortage" ? "Defisit" : "Surplus"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}