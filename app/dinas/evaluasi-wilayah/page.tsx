"use client";

import { useState } from "react";
import { CloudRain, Droplets, Thermometer } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, LoadingRows, Select } from "@/components/ui/Basics";
import { LineChart, LineChartLegend } from "@/components/charts/LineChart";
import { useForecastSeriesQuery, useKomoditasQuery, useWeatherQuery, useWilayahQuery } from "@/hooks/useQueries";

const MUSIM_LABEL: Record<string, string> = { musim_hujan: "Musim Hujan", musim_kemarau: "Musim Kemarau", peralihan: "Peralihan (Pancaroba)" };

export default function EvaluasiWilayahPage() {
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const wilayahList = wilayahQuery.data ?? [];
  const komoditasList = komoditasQuery.data ?? [];

  const [idWilayah, setIdWilayah] = useState("");
  const [idKomoditas, setIdKomoditas] = useState("");
  const activeWilayah = idWilayah || wilayahList[0]?.id || "";
  const activeKomoditas = idKomoditas || komoditasList[0]?.id || "";
  const w = wilayahList.find((x) => x.id === activeWilayah);
  const k = komoditasList.find((x) => x.id === activeKomoditas);

  const weatherQuery = useWeatherQuery(w?.latitude ?? 0, w?.longitude ?? 0, w?.id ?? "none");
  const seriesQuery = useForecastSeriesQuery(activeWilayah, activeKomoditas);
  const series = seriesQuery.data ?? [];

  return (
    <>
      <TopBar title="Detail Evaluasi Wilayah" subtitle="Kondisi historis, faktor musim, dan pola konsumsi per wilayah" />
      <div className="space-y-6 p-5 md:p-8 text-slate-100">
        <Card padding="sm" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl flex flex-wrap gap-4 p-4">
          <label className="text-xs font-semibold text-slate-400">
            Wilayah
            <Select className="mt-1 w-56 bg-[#051410] border-emerald-900/50 text-white" value={activeWilayah} onChange={(e) => setIdWilayah(e.target.value)}>
              {wilayahList.map((w) => <option key={w.id} value={w.id}>{w.nama_wilayah}</option>)}
            </Select>
          </label>
          <label className="text-xs font-semibold text-slate-400">
            Komoditas
            <Select className="mt-1 w-48 bg-[#051410] border-emerald-900/50 text-white" value={activeKomoditas} onChange={(e) => setIdKomoditas(e.target.value)}>
              {komoditasList.map((k) => <option key={k.id} value={k.id}>{k.nama_komoditas}</option>)}
            </Select>
          </label>
        </Card>

        <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
          <h2 className="mb-4 font-bold text-white">Faktor Musim & Cuaca, {w?.nama_wilayah}</h2>
          {weatherQuery.isLoading ? (
            <LoadingRows rows={1} />
          ) : weatherQuery.data ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-orange-500/30 bg-orange-950/20 p-4">
                <Thermometer className="h-5 w-5 text-orange-400" />
                <p className="mt-2 text-xl font-bold text-white">{weatherQuery.data.suhu_c}°C</p>
                <p className="text-xs text-slate-400">Suhu Saat Ini</p>
              </div>
              <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4">
                <CloudRain className="h-5 w-5 text-sky-400" />
                <p className="mt-2 text-xl font-bold text-white">{weatherQuery.data.curah_hujan_mm} mm</p>
                <p className="text-xs text-slate-400">Curah Hujan</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <Droplets className="h-5 w-5 text-emerald-400" />
                <p className="mt-2 text-xl font-bold text-white">{weatherQuery.data.kelembapan_persen}%</p>
                <p className="text-xs text-slate-400">Kelembapan</p>
              </div>
              <div className="rounded-2xl border border-emerald-900/50 bg-[#051410] p-4 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-400">Kategori Musim</p>
                  <p className="mt-1 text-sm font-bold text-slate-200">{MUSIM_LABEL[weatherQuery.data.kategori_musim] ?? weatherQuery.data.kategori_musim}</p>
                </div>
                <div className="mt-2">
                  <Badge status={weatherQuery.data.status === "live" ? "aman" : "warning"}>
                    {weatherQuery.data.status === "live" ? "Data langsung" : "Data fallback"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Data cuaca tidak tersedia.</p>
          )}
          <p className="mt-4 text-xs text-slate-400">
            FR-09: variabel cuaca diambil real-time dari API publik Open-Meteo sebagai pengganti API BMKG pada purwarupa ini, digunakan sebagai pendukung akurasi model forecasting terhadap pola panen/paceklik[cite: 10].
          </p>
        </Card>

        <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
          <h2 className="mb-1 font-bold text-white">Pola Historis Proyeksi Stok vs Kebutuhan</h2>
          <p className="mb-4 text-xs text-slate-400">{k?.nama_komoditas} di {w?.nama_wilayah}</p>
          {seriesQuery.isLoading ? (
            <LoadingRows />
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
      </div>
    </>
  );
}