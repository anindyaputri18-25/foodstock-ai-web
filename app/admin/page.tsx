"use client";

import { Activity, Database, ServerCog, ShieldAlert, UsersRound, Play, Clock } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, LoadingRows, StatCard } from "@/components/ui/Basics";
import { useAuditLogQuery, useKomoditasQuery, useUsersQuery, useWilayahQuery, useStokEntriesQuery, useForecastResultsQuery } from "@/hooks/useQueries";
import { useRunForecastMutation } from "@/hooks/useMutations";
import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui/Basics";
import { LineChart, LineChartLegend } from "@/components/charts/LineChart";
import { pseudoNoise } from "@/lib/pseudo-noise";

function buildUptimeSeries() {
  const labels = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);
  const values = labels.map((_, i) => 180 + Math.round(Math.sin(i / 2) * 40 + pseudoNoise(i, 1) * 20));
  return { labels, values };
}

export default function AdminDashboardPage() {
  const usersQuery = useUsersQuery();
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const auditQuery = useAuditLogQuery();
  const stokQuery = useStokEntriesQuery();
  const forecastQuery = useForecastResultsQuery();
  const runForecast = useRunForecastMutation();
  const session = useSessionStore((s) => s.session);
  const showToast = useUIStore((s) => s.showToast);
  const lastUpdated = (stokQuery.data ?? []).reduce((latest, row) => row.tanggal > latest ? row.tanggal : latest, "");
  const simulatedCount = (stokQuery.data ?? []).filter((row) => row.sumber === "simulasi").length;
  const uptime = buildUptimeSeries();

  const users = usersQuery.data ?? [];
  const aktif = users.filter((u) => u.status === "aktif").length;
  const pending = users.filter((u) => u.status === "pending").length;

  return (
    <>
      <TopBar title="Dashboard Admin" subtitle="Ringkasan statistik sistem, pengguna, dan aktivitas terbaru" />
      <div className="space-y-6 p-5 md:p-8">
        {/* Card Sinkronisasi / Pembaruan Data */}
        <div className="agri-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <Clock className="h-4 w-4" /> Data terakhir diperbarui
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                {lastUpdated ? new Date(lastUpdated).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "Belum ada data stok"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {simulatedCount > 0 ? `Data simulasi aktif: ${simulatedCount} baris stok` : "Tidak ada baris stok bertanda simulasi"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button 
                loading={runForecast.isPending} 
                onClick={() => runForecast.mutate({ nama: session?.nama ?? "Administrator", role: "admin" }, { onSuccess: () => showToast("Forecast selesai dijalankan."), onError: () => showToast("Forecast gagal dijalankan.") })}
                
              >
                <Play className="h-4 w-4" /> Jalankan Forecast
              </Button>
              <span className="text-xs text-slate-400">
                {runForecast.isPending ? "Status: sedang diproses…" : runForecast.isSuccess ? "Status: selesai" : runForecast.isError ? "Status: gagal" : `Hasil forecast: ${forecastQuery.data?.length ?? 0}`}
              </span>
            </div>
          </div>
        </div>

        {/* Grid Metrik Utama */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard tone="emerald" label="Pengguna Aktif" value={aktif} icon={UsersRound} hint={<span className="text-amber-300">{pending} menunggu verifikasi</span>} />
          <StatCard tone="sky" label="Wilayah Terpantau" value={wilayahQuery.data?.length ?? "…"} icon={Database} hint={`${komoditasQuery.data?.length ?? "…"} komoditas pokok`} />
          <StatCard gradient="violet" label="Status Sistem" value="Aktif" icon={ServerCog} hint="Uptime simulasi 99.9%" />
          <StatCard label="Akun Terkunci" value={users.filter((u) => u.status === "terkunci").length} icon={ShieldAlert} tone="rose" hint="≥5x percobaan login gagal" />
        </div>

        {/* Peringatan jika data kosong */}
        {((stokQuery.data ?? []).length === 0 || (forecastQuery.data ?? []).length === 0) && (
          <div className="agri-card p-6 border-amber-500/30 bg-amber-950/10">
            <h2 className="font-bold text-amber-300">{(stokQuery.data ?? []).length === 0 ? "Belum ada data historis" : "Belum ada hasil forecast"}</h2>
            <p className="mt-1 text-sm text-slate-300">Impor data awal BPS/Bapanas terlebih dahulu agar pemantauan dan forecasting memiliki data masukan.</p>
            <a href="/dinas/input-stok" className="mt-3 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 transition">Buka halaman impor data</a>
          </div>
        )}

        {/* Grafik Uptime Server */}
        <div className="agri-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-white">Waktu Respons Server (Simulasi)</h2>
            <LineChartLegend series={[{ label: "Response time (ms)", color: "#10b981", values: [] }]} />
          </div>
          <LineChart labels={uptime.labels} series={[{ label: "Response time (ms)", color: "#10b981", values: uptime.values }]} />
        </div>

        {/* Tabel Aktivitas Log Pengguna Terbaru */}
        <div className="agri-card overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4 border-b border-emerald-900/30">
            <h2 className="flex items-center gap-2 font-bold text-white">
              <Activity className="h-4.5 w-4.5 text-emerald-400" /> Aktivitas Log Pengguna Terbaru
            </h2>
          </div>
          <div className="overflow-x-auto p-6 pt-2">
            {auditQuery.isLoading ? (
              <LoadingRows />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400">
                    <th className="pb-3 pr-4">Waktu</th>
                    <th className="pb-3 pr-4">Aktor</th>
                    <th className="pb-3 pr-4">Aksi</th>
                    <th className="pb-3">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20">
                  {(auditQuery.data ?? []).slice(0, 12).map((log) => (
                    <tr key={log.id} className="hover:bg-emerald-950/20 transition">
                      <td className="py-3.5 pr-4 text-slate-400 text-xs">{new Date(log.waktu).toLocaleString("id-ID")}</td>
                      <td className="py-3.5 pr-4 font-semibold text-slate-200">{log.aktor}</td>
                      <td className="py-3.5 pr-4 text-slate-300">{log.aksi}</td>
                      <td className="py-3.5 text-slate-400">{log.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}