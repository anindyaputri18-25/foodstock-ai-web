"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw, ShieldCheck, TrendingUp } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Button, Card, LoadingRows, Select, StatCard } from "@/components/ui/Basics";
import { StatusGrid, StatusLegend } from "@/components/charts/StatusGrid";
import { LineChart, LineChartLegend } from "@/components/charts/LineChart";
import {
  useForecastResultsQuery,
  useForecastSeriesQuery,
  useKomoditasQuery,
  useNotifikasiQuery,
  useWilayahQuery,
} from "@/hooks/useQueries";
import { useRunForecastMutation } from "@/hooks/useMutations";
import { useUIStore } from "@/store/useUIStore";
import { useSessionStore } from "@/store/useSessionStore";

export default function DinasDashboardPage() {
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const forecastQuery = useForecastResultsQuery();
  const notifQuery = useNotifikasiQuery();
  const filter = useUIStore((s) => s.dashboardFilter);
  const setFilter = useUIStore((s) => s.setDashboardFilter);
  const showToast = useUIStore((s) => s.showToast);
  const session = useSessionStore((s) => s.session);
  const runForecast = useRunForecastMutation();

  const wilayahList = wilayahQuery.data ?? [];
  const komoditasList = komoditasQuery.data ?? [];
  const results = forecastQuery.data ?? [];

  const komoditasIdForChart = filter.komoditas !== "semua" ? filter.komoditas : komoditasList[0]?.id ?? "";
  const wilayahIdForChart = filter.wilayah !== "semua" ? filter.wilayah : wilayahList[0]?.id ?? "";
  const seriesQuery = useForecastSeriesQuery(wilayahIdForChart, komoditasIdForChart);

  const urgent = [...(notifQuery.data ?? [])]
    .filter((n) => n.tindak_lanjut === "menunggu_tindak_lanjut")
    .sort((a, b) => (a.waktu < b.waktu ? 1 : -1))[0];

  const perWilayah = wilayahList
    .filter((w) => filter.wilayah === "semua" || w.id === filter.wilayah)
    .map((w) => {
      const relevan = results.filter((r) => r.id_wilayah === w.id && (filter.komoditas === "semua" || r.id_komoditas === filter.komoditas));
      const worst = relevan.find((r) => r.status === "shortage") ?? relevan.find((r) => r.status === "surplus") ?? relevan[0];
      const ratio = worst ? worst.nilai_proyeksi_ketersediaan / Math.max(1, worst.nilai_proyeksi_kebutuhan) : 1;
      return { id: w.id, label: w.nama_wilayah, ratio, status: worst?.status ?? "aman" as const };
    });

  const jumlahAman = perWilayah.filter((w) => w.status === "aman").length;
  const jumlahShortage = perWilayah.filter((w) => w.status === "shortage").length;
  const jumlahSurplus = perWilayah.filter((w) => w.status === "surplus").length;

  const w = wilayahList.find((x) => x.id === wilayahIdForChart);
  const k = komoditasList.find((x) => x.id === komoditasIdForChart);

  return (
    <>
      <TopBar title="Dashboard Monitoring Pangan" subtitle="Pantau ketersediaan & distribusi logistik nasional secara real-time" />
      <div className="space-y-6 p-5 md:p-8 text-slate-100">
        {urgent && (
          <div className={`rounded-2xl border p-4 text-sm ${urgent.status === "shortage" ? "border-rose-500/40 bg-rose-950/30 text-rose-300" : "border-sky-500/40 bg-sky-950/30 text-sky-300"}`} role="status">
            <strong className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4 shrink-0" /> PERINGATAN DINI: {urgent.pesan}
            </strong>
            <p className="mt-1 text-xs text-slate-300">{urgent.rekomendasi_tindakan}</p>
          </div>
        )}

        <Card padding="sm" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 p-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /> Sistem Aktif · {wilayahList.length} Wilayah Terpantau
          </span>
          <Button
            variant="outline"
            size="sm"
            loading={runForecast.isPending}
            onClick={() =>
              runForecast.mutate({ nama: session?.nama ?? "Dinas", role: "dinas" }, { onSuccess: () => showToast("Data forecasting diperbarui.") })
            }
            className="border-emerald-800 text-emerald-300 hover:bg-emerald-950 rounded-xl"
          >
            <RefreshCcw className="h-4 w-4" /> Perbarui Data
          </Button>
        </Card>

        <Card padding="sm" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <label className="text-xs font-semibold text-slate-400">
            Wilayah
            <Select value={filter.wilayah} onChange={(e) => setFilter({ wilayah: e.target.value })} className="mt-1 bg-[#051410] border-emerald-900/50 text-white">
              <option value="semua">Semua Wilayah</option>
              {wilayahList.map((w) => (
                <option key={w.id} value={w.id}>{w.nama_wilayah}</option>
              ))}
            </Select>
          </label>
          <label className="text-xs font-semibold text-slate-400">
            Komoditas
            <Select value={filter.komoditas} onChange={(e) => setFilter({ komoditas: e.target.value })} className="mt-1 bg-[#051410] border-emerald-900/50 text-white">
              <option value="semua">Semua Komoditas</option>
              {komoditasList.map((k) => (
                <option key={k.id} value={k.id}>{k.nama_komoditas}</option>
              ))}
            </Select>
          </label>
          <label className="text-xs font-semibold text-slate-400">
            Periode
            <Select value={filter.periodeHari} onChange={(e) => setFilter({ periodeHari: Number(e.target.value) })} className="mt-1 bg-[#051410] border-emerald-900/50 text-white">
              <option value={7}>7 Hari Terakhir</option>
              <option value={14}>14 Hari Terakhir</option>
              <option value={30}>30 Hari Terakhir</option>
            </Select>
          </label>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Wilayah Status Aman" value={jumlahAman} tone="emerald" icon={ShieldCheck} hint={<Badge status="aman">Aman</Badge>} />
          <StatCard label="Wilayah Defisit" value={jumlahShortage} tone="rose" icon={AlertTriangle} hint={<Badge status="shortage">Kritis (Defisit)</Badge>} />
          <StatCard gradient="sky" label="Wilayah Surplus" value={jumlahSurplus} icon={TrendingUp} hint="Surplus pasokan" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="agri-card tint-emerald border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
            <h2 className="mb-4 font-bold text-white">Peta Status Stok per Wilayah</h2>
            {forecastQuery.isLoading ? <LoadingRows /> : <StatusGrid items={perWilayah} />}
            <div className="mt-4"><StatusLegend /></div>
          </Card>
          <Card className="agri-card tint-sky border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
            <h2 className="mb-1 font-bold text-white">Tren Stok vs Kebutuhan</h2>
            <p className="mb-4 text-xs text-slate-400">{w?.nama_wilayah ?? "-"} · {k?.nama_komoditas ?? "-"}</p>
            {seriesQuery.isLoading ? (
              <LoadingRows />
            ) : (
              <>
                <LineChart
                  labels={(seriesQuery.data ?? []).slice(0, filter.periodeHari).map((p) => p.tanggal.slice(5))}
                  series={[
                    { label: "Stok (Ton)", color: "#10b981", values: (seriesQuery.data ?? []).slice(0, filter.periodeHari).map((p) => p.proyeksi_ketersediaan) },
                    { label: "Kebutuhan (Ton)", color: "#f59e0b", values: (seriesQuery.data ?? []).slice(0, filter.periodeHari).map((p) => p.proyeksi_kebutuhan) },
                  ]}
                />
                <div className="mt-4">
                  <LineChartLegend series={[{ label: "Stok (Ton)", color: "#10b981", values: [] }, { label: "Kebutuhan (Ton)", color: "#f59e0b", values: [] }]} />
                </div>
              </>
            )}
          </Card>
        </div>

        <Card padding="sm" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl flex flex-wrap gap-4 p-4 text-sm">
          <Link href="/dinas/realokasi" className="font-semibold text-emerald-400 hover:text-emerald-300 transition">Lihat Rekomendasi Realokasi →</Link>
          <span className="text-emerald-900">|</span>
          <Link href="/dinas/laporan" className="font-semibold text-emerald-400 hover:text-emerald-300 transition">Ekspor Laporan →</Link>
        </Card>
      </div>
    </>
  );
}