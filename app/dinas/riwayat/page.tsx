"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, EmptyState, LoadingRows } from "@/components/ui/Basics";
import { Modal } from "@/components/ui/Modal";
import { useKomoditasQuery, useNotifikasiQuery, useWilayahQuery } from "@/hooks/useQueries";
import { useTindakLanjutNotifikasiMutation } from "@/hooks/useMutations";
import type { Notifikasi } from "@/types/domain";

export default function RiwayatNotifikasiPage() {
  const notifQuery = useNotifikasiQuery();
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const tindakLanjut = useTindakLanjutNotifikasiMutation();
  const [detail, setDetail] = useState<Notifikasi | null>(null);

  const wById = new Map((wilayahQuery.data ?? []).map((w) => [w.id, w.nama_wilayah]));
  const kById = new Map((komoditasQuery.data ?? []).map((k) => [k.id, k]));
  const list = notifQuery.data ?? [];

  return (
    <>
      <TopBar title="Riwayat & Log Notifikasi" subtitle="Rekam jejak notifikasi sistem dan status kewaspadaan komoditas (FR-10)" />
      <div className="space-y-4 p-5 md:p-8 text-slate-100">
        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            {notifQuery.isLoading ? (
              <div className="p-5"><LoadingRows rows={5} /></div>
            ) : list.length === 0 ? (
              <EmptyState text="Belum ada catatan peringatan dini yang tercatat." />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                    <th className="p-4">Waktu</th>
                    <th className="p-4">Wilayah</th>
                    <th className="p-4">Saluran Notifikasi</th>
                    <th className="p-4">Status Risiko</th>
                    <th className="p-4">Tindak Lanjut</th>
                    <th className="p-4">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20">
                  {list.map((n) => (
                    <tr key={n.id} className="hover:bg-emerald-950/20 transition">
                      <td className="p-4 text-xs text-slate-400">{new Date(n.waktu).toLocaleString("id-ID")}</td>
                      <td className="p-4 font-semibold text-slate-200">{wById.get(n.id_wilayah) ?? n.id_wilayah}</td>
                      <td className="p-4 text-slate-300">{n.kanal.join(" / ")}</td>
                      <td className="p-4"><Badge status={n.status}>{n.status === "shortage" ? "Shortage" : "Surplus"}</Badge></td>
                      <td className="p-4">
                        {n.tindak_lanjut === "menunggu_tindak_lanjut" ? (
                          <span className="text-amber-400 font-medium">Menunggu tindak lanjut</span>
                        ) : (
                          <span className="text-emerald-400 font-medium">Sudah ditindaklanjuti</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button type="button" onClick={() => setDetail(n)} className="rounded-xl border border-emerald-800 bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900 transition">
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Catatan Peringatan">
        {detail && (
          <div className="space-y-3 text-sm text-slate-200">
            <p><strong className="text-slate-400">ID Peringatan:</strong> {detail.id}</p>
            <p><strong className="text-slate-400">Wilayah:</strong> {wById.get(detail.id_wilayah) ?? detail.id_wilayah}</p>
            <p><strong className="text-slate-400">Komoditas:</strong> {kById.get(detail.id_komoditas)?.nama_komoditas ?? detail.id_komoditas}</p>
            <p><strong className="text-slate-400">Pesan Peringatan:</strong> {detail.pesan}</p>
            <p><strong className="text-slate-400">Rekomendasi Tindakan:</strong> {detail.rekomendasi_tindakan}</p>
            {detail.tindak_lanjut === "menunggu_tindak_lanjut" && (
              <button
                type="button"
                onClick={() => { tindakLanjut.mutate(detail.id); setDetail(null); }}
                className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 transition"
              >
                Tandai Sudah Ditindaklanjuti
              </button>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}