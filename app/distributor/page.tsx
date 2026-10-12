"use client";

import { Package, TrendingDown, TrendingUp } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, LoadingRows, StatCard } from "@/components/ui/Basics";
import { StatusGrid, StatusLegend } from "@/components/charts/StatusGrid";
import { useDistribusiEntriesQuery, useForecastResultsQuery, useKomoditasQuery, useWilayahQuery } from "@/hooks/useQueries";
import { useSessionStore } from "@/store/useSessionStore";

export default function DistributorDashboardPage() {
  const session = useSessionStore((s) => s.session);
  const forecastQuery = useForecastResultsQuery();
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const distribusiQuery = useDistribusiEntriesQuery();

  const results = forecastQuery.data ?? [];
  const wilayahList = wilayahQuery.data ?? [];
  const myEntries = (distribusiQuery.data ?? []).filter((d) => d.dicatatOleh === session?.nama);

  const peluangJual = results.filter((r) => r.status === "shortage").length;
  const peluangBeli = results.filter((r) => r.status === "surplus").length;

  const perWilayah = wilayahList.map((w) => {
    const relevan = results.filter((r) => r.id_wilayah === w.id);
    const worst = relevan.find((r) => r.status === "shortage") ?? relevan.find((r) => r.status === "surplus") ?? relevan[0];
    const ratio = worst ? worst.nilai_proyeksi_ketersediaan / Math.max(1, worst.nilai_proyeksi_kebutuhan) : 1;
    return { id: w.id, label: w.nama_wilayah, ratio, status: worst?.status ?? "aman" as const };
  });

  return (
    <>
      <TopBar title="Dashboard Pasokan & Rantai Pasok" subtitle="Peluang distribusi berdasarkan proyeksi status wilayah nasional" />
      <div className="space-y-6 p-5 md:p-8 text-slate-100">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Peluang Penjualan" value={peluangJual} tone="rose" icon={TrendingUp} hint="wilayah berpotensi shortage" />
          <StatCard label="Peluang Pembelian" value={peluangBeli} tone="sky" icon={TrendingDown} hint="wilayah berpotensi surplus" />
          <StatCard gradient="amber" label="Distribusi Tercatat" value={myEntries.length} icon={Package} hint="oleh instansi Anda" />
        </div>

        <Card className="agri-card tint-violet border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
          <h2 className="mb-3 font-bold text-white">Peta Status Stok Nasional</h2>
          {forecastQuery.isLoading ? <LoadingRows /> : <StatusGrid items={perWilayah} />}
          <div className="mt-3"><StatusLegend /></div>
          <p className="mt-3 text-xs text-slate-400">Wilayah berwarna merah (defisit) adalah peluang penjualan; wilayah biru (surplus) adalah peluang pembelian dengan harga cenderung lebih kompetitif.</p>
        </Card>

        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <h2 className="p-5 pb-0 font-bold text-white">Distribusi Terbaru Anda</h2>
          <div className="overflow-x-auto p-5">
            {distribusiQuery.isLoading ? (
              <LoadingRows />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                    <th className="pb-3 pr-4">Tanggal</th>
                    <th className="pb-3 pr-4">Rute</th>
                    <th className="pb-3 pr-4">Jumlah</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20">
                  {myEntries.slice(0, 8).map((d) => (
                    <tr key={d.id} className="hover:bg-emerald-950/20 transition">
                      <td className="py-3 pr-4 text-slate-400 text-xs">{d.tanggal}</td>
                      <td className="py-3 pr-4 text-slate-300">{d.id_wilayah_asal} → {d.id_wilayah_tujuan}</td>
                      <td className="py-3 pr-4 font-bold text-emerald-400">{d.jumlah.toLocaleString("id-ID")}</td>
                      <td className="py-3"><Badge status={d.status}>{d.status}</Badge></td>
                    </tr>
                  ))}
                  {myEntries.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400">Belum ada data distribusi tercatat.</td></tr>
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