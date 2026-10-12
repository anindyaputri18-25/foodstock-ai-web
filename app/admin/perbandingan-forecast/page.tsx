"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Basics";
import { useDataStore } from "@/store/useDataStore";

export default function PerbandinganForecastPage() {
  const forecasts = useDataStore((s) => s.forecastResults);
  const konsumsi = useDataStore((s) => s.konsumsiEntries);
  const wilayah = useDataStore((s) => s.wilayah);
  const komoditas = useDataStore((s) => s.komoditas);

  const rows = forecasts.map((f) => {
    const actual = konsumsi
      .filter((k) => k.id_wilayah === f.id_wilayah && k.id_komoditas === f.id_komoditas)
      .sort((a, b) => b.periode.localeCompare(a.periode))[0];
    const forecast = f.nilai_proyeksi_kebutuhan;
    const aktual = actual?.jumlah ?? null;
    return {
      id: f.id,
      wilayah: wilayah.find((w) => w.id === f.id_wilayah)?.nama_wilayah ?? f.id_wilayah,
      komoditas: komoditas.find((k) => k.id === f.id_komoditas)?.nama_komoditas ?? f.id_komoditas,
      periode: actual?.periode ?? f.periode,
      forecast,
      aktual,
      ape: aktual !== null && aktual !== 0 ? Math.abs((aktual - forecast) / aktual) * 100 : null,
      version: "simulasi-v1",
    };
  });

  return (
    <>
      <TopBar title="Forecast vs Aktual" subtitle="Evaluasi proyeksi terhadap data aktual untuk mendukung NFR-05" />
      <div className="space-y-4 p-5 md:p-8">
        <Card className="agri-card p-6 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl">
          <p className="text-sm text-slate-300">Aktual menggunakan konsumsi terbaru yang tersedia sebagai pembanding sementara. Untuk evaluasi produksi, simpan snapshot forecast dan bandingkan dengan aktual pada periode yang sama.</p>
          <p className="mt-2 text-xs text-amber-400">Model dan metrik pada purwarupa ini bersifat simulasi, bukan bukti akurasi produksi.</p>
        </Card>
        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                <tr>{["Wilayah", "Komoditas", "Periode aktual", "Forecast kebutuhan", "Aktual konsumsi", "APE (%)", "Versi model"].map((h) => (<th key={h} className="p-3">{h}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-950/20 transition">
                    <td className="p-3 font-semibold text-slate-200">{r.wilayah}</td>
                    <td className="p-3 text-slate-300">{r.komoditas}</td>
                    <td className="p-3 text-slate-400">{r.periode}</td>
                    <td className="p-3 text-slate-200">{r.forecast.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-slate-300">{r.aktual === null ? "Belum tersedia" : r.aktual.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-slate-300">{r.ape === null ? "—" : r.ape.toFixed(2)}</td>
                    <td className="p-3 text-xs text-slate-400">{r.version}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Belum ada hasil forecast. Jalankan forecast setelah data historis diimpor.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}