"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, LoadingRows, Select } from "@/components/ui/Basics";
import { LineChart, LineChartLegend } from "@/components/charts/LineChart";
import { useForecastSeriesQuery, useKomoditasQuery, useWilayahQuery } from "@/hooks/useQueries";

export default function TrenPasarPage() {
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

  const seriesQuery = useForecastSeriesQuery(activeWilayah, activeKomoditas);
  const series = seriesQuery.data ?? [];

  const indeksHarga = series.map((p) => {
    const rasio = p.proyeksi_ketersediaan / Math.max(1, p.proyeksi_kebutuhan);
    return Math.round((2 - Math.min(1.8, rasio)) * 100);
  });

  const last = series[series.length - 1];
  const status = last?.status ?? "aman";

  return (
    <>
      <TopBar title="Tren Permintaan & Proyeksi Pasar" subtitle="Estimasi arah permintaan dan indeks harga relatif berdasarkan proyeksi pasokan" />
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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white">Proyeksi Permintaan vs Ketersediaan</h2>
              <p className="text-xs text-slate-400 mt-0.5">{w?.nama_wilayah} · {k?.nama_komoditas}</p>
            </div>
            <Badge status={status}>{status === "shortage" ? "Permintaan Tinggi" : status === "surplus" ? "Pasokan Berlebih" : "Seimbang"}</Badge>
          </div>
          {seriesQuery.isLoading ? (
            <LoadingRows />
          ) : (
            <>
              <LineChart
                labels={series.map((p) => p.tanggal.slice(5))}
                series={[
                  { label: "Ketersediaan", color: "#10b981", values: series.map((p) => p.proyeksi_ketersediaan) },
                  { label: "Kebutuhan", color: "#f59e0b", values: series.map((p) => p.proyeksi_kebutuhan) },
                ]}
              />
              <div className="mt-4">
                <LineChartLegend series={[{ label: "Ketersediaan", color: "#10b981", values: [] }, { label: "Kebutuhan", color: "#f59e0b", values: [] }]} />
              </div>
            </>
          )}
        </Card>

        <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
          <h2 className="mb-1 font-bold text-white">Indeks Harga Relatif (Estimasi)</h2>
          <p className="mb-4 text-xs text-slate-400">Diturunkan dari rasio ketersediaan terhadap kebutuhan, bukan data harga pasar riil</p>
          {seriesQuery.isLoading ? (
            <LoadingRows />
          ) : (
            <LineChart labels={series.map((p) => p.tanggal.slice(5))} series={[{ label: "Indeks Harga", color: "#a855f7", values: indeksHarga }]} />
          )}
        </Card>
      </div>
    </>
  );
}