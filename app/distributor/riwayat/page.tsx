"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, EmptyState, LoadingRows } from "@/components/ui/Basics";
import { useDistribusiEntriesQuery, useKomoditasQuery, useWilayahQuery } from "@/hooks/useQueries";
import { useSessionStore } from "@/store/useSessionStore";

export default function RiwayatPengirimanPage() {
  const distribusiQuery = useDistribusiEntriesQuery();
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const session = useSessionStore((s) => s.session);

  const wById = new Map((wilayahQuery.data ?? []).map((w) => [w.id, w.nama_wilayah]));
  const kById = new Map((komoditasQuery.data ?? []).map((k) => [k.id, k]));
  const myEntries = (distribusiQuery.data ?? []).filter((d) => d.dicatatOleh === session?.nama);

  return (
    <>
      <TopBar title="Riwayat Pengiriman" subtitle="Seluruh catatan distribusi yang pernah diinput oleh instansi Anda" />
      <div className="space-y-4 p-5 md:p-8 text-slate-100">
        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            {distribusiQuery.isLoading ? (
              <div className="p-5"><LoadingRows rows={5} /></div>
            ) : myEntries.length === 0 ? (
              <EmptyState text="Belum ada riwayat pengiriman." />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Asal</th>
                    <th className="p-4">Tujuan</th>
                    <th className="p-4">Komoditas</th>
                    <th className="p-4">Jumlah</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20">
                  {myEntries.map((d) => (
                    <tr key={d.id} className="hover:bg-emerald-950/20 transition">
                      <td className="p-4 text-xs text-slate-400">{d.tanggal}</td>
                      <td className="p-4 font-medium text-slate-200">{wById.get(d.id_wilayah_asal) ?? d.id_wilayah_asal}</td>
                      <td className="p-4 font-medium text-slate-200">{wById.get(d.id_wilayah_tujuan) ?? d.id_wilayah_tujuan}</td>
                      <td className="p-4 text-slate-300">{kById.get(d.id_komoditas)?.nama_komoditas ?? d.id_komoditas}</td>
                      <td className="p-4 font-semibold text-emerald-400">{d.jumlah.toLocaleString("id-ID")} {kById.get(d.id_komoditas)?.satuan}</td>
                      <td className="p-4"><Badge status={d.status}>{d.status}</Badge></td>
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