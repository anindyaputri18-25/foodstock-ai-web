"use client";

import { PrintedAt } from "@/components/ui/PrintedAt";
import { useState } from "react";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button, Card, Select } from "@/components/ui/Basics";
import { useForecastResultsQuery, useKomoditasQuery, useRekomendasiQuery, useWilayahQuery } from "@/hooks/useQueries";
import { exportToCSV, exportToExcel, printReport } from "@/lib/export";

type JenisLaporan = "proyeksi" | "status" | "realokasi";

export default function LaporanPage() {
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const forecastQuery = useForecastResultsQuery();
  const rekomQuery = useRekomendasiQuery();
  const [jenis, setJenis] = useState<JenisLaporan>("proyeksi");

  const wById = new Map((wilayahQuery.data ?? []).map((w) => [w.id, w.nama_wilayah]));
  const kById = new Map((komoditasQuery.data ?? []).map((k) => [k.id, k]));

  const proyeksiRows = (forecastQuery.data ?? []).map((f) => [
    wById.get(f.id_wilayah) ?? f.id_wilayah,
    kById.get(f.id_komoditas)?.nama_komoditas ?? f.id_komoditas,
    f.nilai_proyeksi_ketersediaan,
    f.nilai_proyeksi_kebutuhan,
    f.status,
    `${f.mape.toFixed(1)}%`,
  ]);
  const statusRows = (forecastQuery.data ?? []).map((f) => [
    wById.get(f.id_wilayah) ?? f.id_wilayah,
    kById.get(f.id_komoditas)?.nama_komoditas ?? f.id_komoditas,
    f.status,
    f.hari_menuju_kejadian > 30 ? "-" : `${f.hari_menuju_kejadian} hari`,
  ]);
  const realokasiRows = (rekomQuery.data ?? []).map((r) => [
    kById.get(r.id_komoditas)?.nama_komoditas ?? r.id_komoditas,
    r.wilayah_asal,
    r.wilayah_tujuan,
    r.jumlah_saran,
    `${r.jarak_km} km`,
    r.status,
  ]);

  const CONFIG: Record<JenisLaporan, { title: string; headers: string[]; rows: (string | number)[][] }> = {
    proyeksi: { title: "Laporan Proyeksi Stok Pangan", headers: ["Wilayah", "Komoditas", "Proyeksi Ketersediaan", "Proyeksi Kebutuhan", "Status", "MAPE"], rows: proyeksiRows },
    status: { title: "Laporan Status Stok per Wilayah", headers: ["Wilayah", "Komoditas", "Status", "Estimasi Hari Menuju Kejadian"], rows: statusRows },
    realokasi: { title: "Laporan Rekomendasi Realokasi Distribusi", headers: ["Komoditas", "Wilayah Asal", "Wilayah Tujuan", "Jumlah Saran", "Jarak", "Status"], rows: realokasiRows },
  };
  const active = CONFIG[jenis];

  return (
    <>
      <TopBar title="Laporan & Ekspor Data" subtitle="Rekap proyeksi stok dan evaluasi kebijakan, siap dicetak atau diunduh (FR-07)" />
      <div className="space-y-6 p-5 md:p-8 text-slate-100">
        <Card padding="sm" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl flex flex-wrap items-end gap-4 p-4">
          <label className="text-xs font-semibold text-slate-400">
            Jenis Laporan
            <Select className="mt-1 w-64 bg-[#051410] border-emerald-900/50 text-white" value={jenis} onChange={(e) => setJenis(e.target.value as JenisLaporan)}>
              <option value="proyeksi">Proyeksi Stok Pangan</option>
              <option value="status">Status Stok per Wilayah</option>
              <option value="realokasi">Rekomendasi Realokasi Distribusi</option>
            </Select>
          </label>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToCSV(active.title, active.headers, active.rows)} className="border-emerald-800 text-emerald-300 hover:bg-emerald-950 rounded-xl">
              <FileText className="h-4 w-4" /> Unduh CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToExcel(active.title, active.title, active.headers, active.rows)} className="border-emerald-800 text-emerald-300 hover:bg-emerald-950 rounded-xl">
              <FileSpreadsheet className="h-4 w-4" /> Unduh Excel
            </Button>
            <Button size="sm" onClick={printReport} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/50">
              <Printer className="h-4 w-4" /> Cetak / Simpan PDF
            </Button>
          </div>
        </Card>

        <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6 print-area">
          <h2 className="mb-1 text-lg font-bold text-white">{active.title}</h2>
          <p className="mb-4 text-xs text-slate-400">Dicetak pada <PrintedAt /></p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                  {active.headers.map((h) => <th key={h} className="pb-3 pr-4">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {active.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-emerald-950/20 transition">
                    {row.map((cell, j) => <td key={j} className="py-3 pr-4 text-slate-300">{cell}</td>)}
                  </tr>
                ))}
                {active.rows.length === 0 && (
                  <tr><td colSpan={active.headers.length} className="py-8 text-center text-slate-400">Belum ada data untuk laporan ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}