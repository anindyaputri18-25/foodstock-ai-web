"use client";

import { Mail, MessageCircle, MonitorSmartphone } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Card, EmptyState, LoadingRows } from "@/components/ui/Basics";
import { useKomoditasQuery, useNotifikasiQuery, useWilayahQuery } from "@/hooks/useQueries";
import { useTindakLanjutNotifikasiMutation } from "@/hooks/useMutations";
import { useUIStore } from "@/store/useUIStore";

const KANAL_ICON: Record<string, typeof Mail> = { dashboard: MonitorSmartphone, whatsapp: MessageCircle, email: Mail };

export default function BulogNotifikasiPage() {
  const notifQuery = useNotifikasiQuery();
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const tindakLanjut = useTindakLanjutNotifikasiMutation();
  const showToast = useUIStore((s) => s.showToast);

  const wById = new Map((wilayahQuery.data ?? []).map((w) => [w.id, w.nama_wilayah]));
  const kById = new Map((komoditasQuery.data ?? []).map((k) => [k.id, k]));
  const shortageList = (notifQuery.data ?? []).filter((n) => n.status === "shortage");

  return (
    <>
      <TopBar title="Notifikasi Early Warning" subtitle="Peringatan potensi shortage yang memerlukan tindakan gudang segera (FR-05)" />
      <div className="space-y-4 p-5 md:p-8">
        {notifQuery.isLoading ? (
          <LoadingRows rows={4} />
        ) : shortageList.length === 0 ? (
          <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 p-6"><EmptyState text="Tidak ada peringatan shortage saat ini." /></Card>
        ) : (
          shortageList.map((n) => (
            <Card key={n.id} className={`agri-card border p-6 backdrop-blur-xl transition ${n.tindak_lanjut === "menunggu_tindak_lanjut" ? "border-rose-500/40 bg-rose-950/10" : "border-emerald-900/40 bg-[#081c16]/80"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge status="shortage">Shortage</Badge>
                    <span className="text-xs text-slate-400">{new Date(n.waktu).toLocaleString("id-ID")}</span>
                  </div>
                  <p className="mt-2 font-bold text-white">{wById.get(n.id_wilayah) ?? n.id_wilayah}, {kById.get(n.id_komoditas)?.nama_komoditas ?? n.id_komoditas}</p>
                  <p className="mt-1 text-sm text-slate-300">{n.pesan}</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-400">{n.rekomendasi_tindakan}</p>
                  <div className="mt-3 flex gap-2">
                    {n.kanal.map((kanal) => {
                      const Icon = KANAL_ICON[kanal] ?? Mail;
                      return (
                        <span key={kanal} className="flex items-center gap-1 rounded-full bg-[#051410] border border-emerald-900/50 px-2.5 py-1 text-[11px] text-slate-400">
                          <Icon className="h-3 w-3 text-emerald-400" /> {kanal}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {n.tindak_lanjut === "menunggu_tindak_lanjut" ? (
                  <button
                    type="button"
                    onClick={() => { tindakLanjut.mutate(n.id); showToast("Ditandai sudah ditindaklanjuti."); }}
                    className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-md"
                  >
                    Tandai Ditindaklanjuti
                  </button>
                ) : (
                  <Badge status="aman">Sudah Ditindaklanjuti</Badge>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}