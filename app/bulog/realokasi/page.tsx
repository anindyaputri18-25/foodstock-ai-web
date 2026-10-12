"use client";

import { CheckCircle2, MoveRight, Truck } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, EmptyState, LoadingRows } from "@/components/ui/Basics";
import { useKomoditasQuery, useRekomendasiQuery } from "@/hooks/useQueries";
import { useUpdateRekomendasiMutation } from "@/hooks/useMutations";
import { useUIStore } from "@/store/useUIStore";

export default function BulogRealokasiPage() {
  const rekomQuery = useRekomendasiQuery();
  const komoditasQuery = useKomoditasQuery();
  const updateMutation = useUpdateRekomendasiMutation();
  const showToast = useUIStore((s) => s.showToast);

  const komoditasById = new Map((komoditasQuery.data ?? []).map((k) => [k.id, k]));
  const list = (rekomQuery.data ?? []).filter((r) => r.status === "disetujui" || r.status === "selesai");

  return (
    <>
      <TopBar title="Rencana Realokasi Logistik" subtitle="Eksekusi pengiriman untuk rekomendasi realokasi yang telah disetujui Dinas (FR-06)" />
      <div className="space-y-4 p-5 md:p-8">
        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            {rekomQuery.isLoading ? (
              <div className="p-5"><LoadingRows rows={4} /></div>
            ) : list.length === 0 ? (
              <div className="p-6"><EmptyState text="Belum ada rencana realokasi yang disetujui untuk dieksekusi." /></div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                    <th className="p-4">Komoditas</th>
                    <th className="p-4">Rute</th>
                    <th className="p-4">Jumlah</th>
                    <th className="p-4">Jarak</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20">
                  {list.map((r) => {
                    const komoditas = komoditasById.get(r.id_komoditas);
                    return (
                      <tr key={r.id} className="hover:bg-emerald-950/20 transition">
                        <td className="p-4 font-semibold text-slate-200">{komoditas?.nama_komoditas ?? r.id_komoditas}</td>
                        <td className="p-4 text-slate-300">
                          <span className="text-teal-400 font-medium">{r.wilayah_asal}</span>
                          <MoveRight className="mx-2 inline h-3.5 w-3.5 text-slate-500" />
                          <span className="text-rose-400 font-medium">{r.wilayah_tujuan}</span>
                        </td>
                        <td className="p-4 font-bold text-white">{r.jumlah_saran.toLocaleString("id-ID")} {komoditas?.satuan}</td>
                        <td className="p-4 text-slate-400 text-xs">{r.jarak_km} km</td>
                        <td className="p-4"><Badge status={r.status}>{r.status === "selesai" ? "Selesai" : "Siap Dikirim"}</Badge></td>
                        <td className="p-4">
                          {r.status === "disetujui" && (
                            <button
                              type="button"
                              onClick={() => { updateMutation.mutate({ id: r.id, status: "selesai" }); showToast("Realokasi ditandai selesai dikirim."); }}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white transition"
                            >
                              <Truck className="h-3.5 w-3.5" /> Tandai Terkirim
                            </button>
                          )}
                          {r.status === "selesai" && (
                            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}