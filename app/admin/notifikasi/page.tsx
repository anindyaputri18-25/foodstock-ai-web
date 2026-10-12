"use client";

import { useState } from "react";
import { Mail, RotateCw, Search } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Button, Card, Input } from "@/components/ui/Basics";
import { useDataStore } from "@/store/useDataStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";

export default function AdminNotifikasiPage() {
  const rows = useDataStore((s) => s.notifikasi);
  const retry = useDataStore((s) => s.retryEmailNotification);
  const saveFollowup = useDataStore((s) => s.saveNotificationFollowup);
  const session = useSessionStore((s) => s.session);
  const toast = useUIStore((s) => s.showToast);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = rows.filter((n) => `${n.pesan} ${n.id_wilayah} ${n.id_komoditas} ${n.status_kirim}`.toLowerCase().includes(q.toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / 10));

  return (
    <>
      <TopBar title="Riwayat Notifikasi" subtitle="Status pengiriman kanal dashboard dan email" />
      <div className="space-y-4 p-5 md:p-8">
        <Card padding="sm" className="agri-card flex items-center gap-3 p-4 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl">
          <Search className="h-5 w-5 text-emerald-400" />
          <Input 
            value={q} 
            onChange={(e) => { setQ(e.target.value); setPage(1); }} 
            placeholder="Cari pesan, wilayah, komoditas, status…" 
            className="bg-[#051410] border-emerald-900/50 text-white placeholder:text-slate-500"
          />
        </Card>

        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Pesan</th>
                  <th className="p-4">Kanal email</th>
                  <th className="p-4">Status peringatan</th>
                  <th className="p-4">Tindak lanjut</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {filtered.slice((page - 1) * 10, page * 10).map((n) => (
                  <tr key={n.id} className="hover:bg-emerald-950/20 transition">
                    <td className="p-4 text-slate-400 text-xs">{new Date(n.waktu).toLocaleString("id-ID")}</td>
                    <td className="p-4">
                      <p className="max-w-xl text-slate-200">{n.pesan}</p>
                      <p className="mt-1 text-xs text-slate-400">ID {n.id}</p>
                    </td>
                    <td className="p-4">
                      <Badge status={n.status_kirim === "terkirim" ? "aman" : n.status_kirim === "gagal" ? "shortage" : "surplus"}>
                        {n.status_kirim === "terkirim" ? "SENT" : n.status_kirim === "gagal" ? "FAILED" : "PENDING"}
                      </Badge>
                    </td>
                    <td className="p-4"><Badge status={n.status}>{n.status}</Badge></td>
                    <td className="p-4">
                      <div className="max-w-xs text-xs text-slate-300">
                        {n.ditangani_oleh && <p>Penanggung jawab: {n.ditangani_oleh}</p>}
                        {n.catatan_tindak_lanjut && <p>Catatan: {n.catatan_tindak_lanjut}</p>}
                        {n.hasil_tindak_lanjut && <p>Hasil: {n.hasil_tindak_lanjut}</p>}
                        <button 
                          type="button"
                          className="mt-1.5 font-semibold text-emerald-400 hover:underline" 
                          onClick={() => {
                            const catatan = window.prompt("Catatan tindak lanjut", n.catatan_tindak_lanjut ?? "");
                            if (catatan === null) return;
                            const hasil = window.prompt("Hasil tindak lanjut", n.hasil_tindak_lanjut ?? "");
                            if (hasil === null) return;
                            saveFollowup(n.id, session?.nama ?? "Administrator", catatan, hasil);
                            toast("Catatan tindak lanjut disimpan dan dicatat di audit log.");
                          }}
                        >
                          Catat tindak lanjut
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      {n.status_kirim === "gagal" ? (
                        <Button size="sm" variant="outline" className="border-emerald-800 text-emerald-300 hover:bg-emerald-950" onClick={() => { retry(n.id, session?.nama ?? "Administrator"); toast("Simulasi pengiriman ulang dicatat."); }}>
                          <RotateCw className="h-4 w-4" /> Kirim ulang
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Mail className="h-3.5 w-3.5" /> Tidak perlu aksi</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Belum ada riwayat notifikasi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-emerald-900/30 p-4 text-sm text-slate-400 bg-emerald-950/10">
            <span>{filtered.length} notifikasi · Halaman {page}/{pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border border-emerald-900/50 px-3 py-1.5 disabled:opacity-40 hover:bg-emerald-950">Sebelumnya</button>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-emerald-900/50 px-3 py-1.5 disabled:opacity-40 hover:bg-emerald-950">Berikutnya</button>
            </div>
          </div>
        </Card>
        <p className="text-xs text-amber-400/90">Mode prototipe: status SENT/FAILED dan kirim ulang belum terhubung ke SMTP/email gateway sungguhan.</p>
      </div>
    </>
  );
}