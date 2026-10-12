"use client";

import { CheckCircle2, MoveRight, TriangleAlert } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, EmptyState, LoadingRows } from "@/components/ui/Basics";
import { useKomoditasQuery, useRekomendasiQuery } from "@/hooks/useQueries";
import { useUpdateRekomendasiMutation } from "@/hooks/useMutations";
import { useUIStore } from "@/store/useUIStore";

const STATUS_LABEL: Record<string, string> = { menunggu: "Menunggu", disetujui: "Disetujui", eskalasi: "Eskalasi", selesai: "Selesai" };

export default function RealokasiPage() {
  const rekomQuery = useRekomendasiQuery();
  const komoditasQuery = useKomoditasQuery();
  const updateMutation = useUpdateRekomendasiMutation();
  const showToast = useUIStore((s) => s.showToast);

  const komoditasById = new Map((komoditasQuery.data ?? []).map((k) => [k.id, k]));
  const list = rekomQuery.data ?? [];

  return (
    <>
      <TopBar title="Rekomendasi Realokasi Distribusi" subtitle="Saran pemindahan komoditas dari wilayah surplus ke wilayah defisit (FR-06)" />
      <div className="space-y-4 p-5 md:p-8 text-slate-100">
        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            {rekomQuery.isLoading ? (
              <div className="p-5"><LoadingRows rows={4} /></div>
            ) : list.length === 0 ? (
              <EmptyState text="Belum ada rekomendasi realokasi. Jalankan ulang model forecasting untuk menghasilkan rekomendasi terbaru." />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                    <th className="p-4">Komoditas</th>
                    <th className="p-4">Asal (Surplus)</th>
                    <th className="p-4"></th>
                    <th className="p-4">Tujuan (Defisit)</th>
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
                        <td className="p-4 text-sky-400 font-medium">{r.wilayah_asal}</td>
                        <td className="p-4 text-emerald-600"><MoveRight className="h-4 w-4" /></td>
                        <td className="p-4 text-rose-400 font-medium">{r.wilayah_tujuan}</td>
                        <td className="p-4 font-semibold text-emerald-400">{r.jumlah_saran.toLocaleString("id-ID")} {komoditas?.satuan}</td>
                        <td className="p-4 text-slate-400">{r.jarak_km} km</td>
                        <td className="p-4"><Badge status={r.status}>{STATUS_LABEL[r.status]}</Badge></td>
                        <td className="p-4">
                          {r.status === "menunggu" && (
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => { updateMutation.mutate({ id: r.id, status: "disetujui" }); showToast("Realokasi disetujui, diteruskan ke Bulog."); }}
                                className="flex items-center gap-1 rounded-xl bg-emerald-950/50 border border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900 transition"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Setujui
                              </button>
                              <button
                                type="button"
                                onClick={() => { updateMutation.mutate({ id: r.id, status: "eskalasi" }); showToast("Rekomendasi dieskalasi."); }}
                                className="flex items-center gap-1 rounded-xl bg-rose-950/50 border border-rose-800 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-900 transition"
                              >
                                <TriangleAlert className="h-3.5 w-3.5 text-rose-400" /> Eskalasi
                              </button>
                            </div>
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