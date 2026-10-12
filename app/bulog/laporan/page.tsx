"use client";

import { PrintedAt } from "@/components/ui/PrintedAt";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button, Card } from "@/components/ui/Basics";
import { useKomoditasQuery, useStokEntriesQuery, useWilayahQuery } from "@/hooks/useQueries";
import { exportToCSV, exportToExcel, printReport } from "@/lib/export";

export default function BulogLaporanPage() {
  const stokQuery = useStokEntriesQuery();
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();

  const wById = new Map((wilayahQuery.data ?? []).map((w) => [w.id, w.nama_wilayah]));
  const kById = new Map((komoditasQuery.data ?? []).map((k) => [k.id, k]));
  const gudangEntries = (stokQuery.data ?? []).filter((e) => e.sumber === "gudang_bulog");

  const headers = ["Tanggal", "Wilayah", "Komoditas", "Jumlah", "Satuan", "Dicatat Oleh"];
  const rows = gudangEntries.map((e) => [
    e.tanggal,
    wById.get(e.id_wilayah) ?? e.id_wilayah,
    kById.get(e.id_komoditas)?.nama_komoditas ?? e.id_komoditas,
    e.jumlah,
    kById.get(e.id_komoditas)?.satuan ?? "",
    e.dicatatOleh,
  ]);
  const title = "Rekapitulasi Stok Gudang Bulog";

  const totalPerKomoditas = new Map<string, number>();
  for (const e of gudangEntries) {
    totalPerKomoditas.set(e.id_komoditas, (totalPerKomoditas.get(e.id_komoditas) ?? 0) + e.jumlah);
  }

  return (
    <>
      <TopBar title="Rekapitulasi & Laporan Gudang" subtitle="Ringkasan stok gudang siap dicetak atau diunduh (FR-07)" />
      <div className="space-y-5 p-5 md:p-8">
        <Card padding="sm" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-4 flex flex-wrap justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(title, headers, rows)} className="border-emerald-800 text-emerald-300 hover:bg-emerald-950 rounded-xl">
            <FileText className="h-4 w-4" /> Unduh CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToExcel(title, title, headers, rows)} className="border-emerald-800 text-emerald-300 hover:bg-emerald-950 rounded-xl">
            <FileSpreadsheet className="h-4 w-4" /> Unduh Excel
          </Button>
          <Button size="sm" onClick={printReport} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl">
            <Printer className="h-4 w-4" /> Cetak / Simpan PDF
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...totalPerKomoditas.entries()].map(([idK, total]) => (
            <Card key={idK} padding="sm" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-4">
              <p className="text-xs font-semibold text-slate-400">{kById.get(idK)?.nama_komoditas ?? idK}</p>
              <p className="mt-2 text-xl font-extrabold text-emerald-400">{total.toLocaleString("id-ID")} <span className="text-xs text-slate-400">{kById.get(idK)?.satuan}</span></p>
            </Card>
          ))}
        </div>

        <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6 print-area">
          <h2 className="mb-1 text-lg font-bold text-white">{title}</h2>
          <p className="mb-4 text-xs text-slate-400">Dicetak pada <PrintedAt /></p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                  {headers.map((h) => <th key={h} className="pb-3 pr-4">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-emerald-950/20 transition">
                    {row.map((cell, j) => <td key={j} className="py-3 pr-4 text-slate-300">{cell}</td>)}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={headers.length} className="py-8 text-center text-slate-400">Belum ada data stok gudang.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}