"use client";

import { AlertTriangle, Warehouse } from "lucide-react";
import { pseudoNoise } from "@/lib/pseudo-noise";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, LoadingRows } from "@/components/ui/Basics";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { LineChart, LineChartLegend } from "@/components/charts/LineChart";
import { useForecastResultsQuery, useKomoditasQuery, useNotifikasiQuery, useWilayahQuery } from "@/hooks/useQueries";

export default function BulogDashboardPage() {
  const forecastQuery = useForecastResultsQuery();
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const notifQuery = useNotifikasiQuery();

  const results = forecastQuery.data ?? [];
  const wById = new Map((wilayahQuery.data ?? []).map((w) => [w.id, w.nama_wilayah]));
  const kById = new Map((komoditasQuery.data ?? []).map((k) => [k.id, k]));

  const totalKetersediaan = results.reduce((a, r) => a + r.nilai_proyeksi_ketersediaan, 0);
  const totalKebutuhan = results.reduce((a, r) => a + r.nilai_proyeksi_kebutuhan, 0);
  const cadanganPersen = totalKebutuhan > 0 ? Math.min(100, (totalKetersediaan / totalKebutuhan) * 50) : 0;

  const kritis = results
    .filter((r) => r.status === "shortage")
    .sort((a, b) => a.hari_menuju_kejadian - b.hari_menuju_kejadian)
    .slice(0, 6);

  const urgentNotif = (notifQuery.data ?? []).filter((n) => n.status === "shortage" && n.tindak_lanjut === "menunggu_tindak_lanjut");

  const labels = Array.from({ length: 14 }, (_, i) => `H-${14 - i}`);
  const penerimaan = labels.map((_, i) => 800 + Math.round(Math.sin(i / 3) * 150 + pseudoNoise(i, 2) * 80));
  const pengeluaran = labels.map((_, i) => 700 + Math.round(Math.cos(i / 3) * 120 + pseudoNoise(i, 3) * 70));

  return (
    <>
      <TopBar title="Dashboard Logistik & Gudang" subtitle="Cadangan nasional, arus keluar-masuk gudang, dan wilayah prioritas" />
      <div className="space-y-6 p-5 md:p-8">
        {urgentNotif.length > 0 && (
          <div className="agri-card p-4 border-rose-500/40 bg-rose-950/20 text-rose-300 shadow-lg" role="status">
            <strong className="flex items-center gap-1.5 font-bold text-rose-400">
              <AlertTriangle className="h-4 w-4" /> {urgentNotif.length} Wilayah Berpotensi Shortage, Perlu Tindakan Segera
            </strong>
            <p className="mt-1 text-xs text-slate-300">{urgentNotif[0]?.pesan}</p>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <Card className="agri-card tint-emerald p-6 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl flex flex-col items-center justify-center">
            <h2 className="mb-2 flex items-center gap-1.5 self-start font-bold text-white">
              <Warehouse className="h-4.5 w-4.5 text-emerald-400" /> Cadangan Nasional
            </h2>
            {forecastQuery.isLoading ? <LoadingRows rows={1} /> : <GaugeChart percent={cadanganPersen} label="Rasio ketersediaan vs kebutuhan" />}
          </Card>

          <Card className="agri-card tint-sky p-6 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl">
            <h2 className="mb-1 font-bold text-white">Arus Penerimaan vs Pengeluaran Gudang</h2>
            <p className="mb-3 text-xs text-slate-400">Estimasi agregat 14 hari terakhir (ton)</p>
            <LineChart
              labels={labels}
              series={[
                { label: "Penerimaan", color: "#10b981", values: penerimaan },
                { label: "Pengeluaran", color: "#f97316", values: pengeluaran },
              ]}
            />
            <LineChartLegend series={[{ label: "Penerimaan", color: "#10b981", values: [] }, { label: "Pengeluaran", color: "#f97316", values: [] }]} />
          </Card>
        </div>

        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <h2 className="p-5 pb-0 font-bold text-white">Wilayah Prioritas (Potensi Shortage Terdekat)</h2>
          <div className="overflow-x-auto p-5">
            {forecastQuery.isLoading ? (
              <LoadingRows />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                    <th className="pb-3 pr-4">Wilayah</th>
                    <th className="pb-3 pr-4">Komoditas</th>
                    <th className="pb-3 pr-4">Estimasi Hari</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20">
                  {kritis.map((r) => (
                    <tr key={r.id} className="hover:bg-emerald-950/20 transition">
                      <td className="py-3 pr-4 font-semibold text-slate-200">{wById.get(r.id_wilayah) ?? r.id_wilayah}</td>
                      <td className="py-3 pr-4 text-slate-300">{kById.get(r.id_komoditas)?.nama_komoditas ?? r.id_komoditas}</td>
                      <td className="py-3 pr-4 font-bold text-rose-400">{r.hari_menuju_kejadian} hari lagi</td>
                      <td className="py-3"><Badge status={r.status}>Defisit</Badge></td>
                    </tr>
                  ))}
                  {kritis.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400">Tidak ada wilayah berstatus kritis saat ini.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}