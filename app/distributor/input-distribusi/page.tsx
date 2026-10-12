"use client";

import { useState, type FormEvent } from "react";
import { Truck } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Button, Card, FormField, Input, LoadingRows, Select } from "@/components/ui/Basics";
import { useDistribusiEntriesQuery, useKomoditasQuery, useWilayahQuery } from "@/hooks/useQueries";
import { useSubmitDistribusiMutation, useUpdateDistribusiStatusMutation } from "@/hooks/useMutations";
import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";
import type { DistribusiEntry } from "@/types/domain";

export default function InputDistribusiPage() {
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const distribusiQuery = useDistribusiEntriesQuery();
  const submitDistribusi = useSubmitDistribusiMutation();
  const updateStatus = useUpdateDistribusiStatusMutation();
  const session = useSessionStore((s) => s.session);
  const showToast = useUIStore((s) => s.showToast);

  const wilayahList = wilayahQuery.data ?? [];
  const komoditasList = komoditasQuery.data ?? [];
  const [form, setForm] = useState({ id_wilayah_asal: "", id_wilayah_tujuan: "", id_komoditas: "", jumlah: "", tanggal: new Date().toISOString().slice(0, 10) });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.id_wilayah_asal || !form.id_wilayah_tujuan || !form.id_komoditas || !form.jumlah) return;
    submitDistribusi.mutate(
      {
        id_wilayah_asal: form.id_wilayah_asal,
        id_wilayah_tujuan: form.id_wilayah_tujuan,
        id_komoditas: form.id_komoditas,
        jumlah: Number(form.jumlah),
        tanggal: form.tanggal,
        status: "rencana",
        dicatatOleh: session?.nama ?? "Distributor",
      },
      { onSuccess: () => showToast("Data distribusi tersimpan.") },
    );
    setForm({ ...form, jumlah: "" });
  };

  const wById = new Map(wilayahList.map((w) => [w.id, w.nama_wilayah]));
  const kById = new Map(komoditasList.map((k) => [k.id, k]));
  const myEntries = (distribusiQuery.data ?? []).filter((d) => d.dicatatOleh === session?.nama);

  const nextStatus: Record<DistribusiEntry["status"], DistribusiEntry["status"] | null> = {
    rencana: "dikirim",
    dikirim: "selesai",
    selesai: null,
  };

  return (
    <>
      <TopBar title="Input Data Distribusi" subtitle="Catat rencana dan progres pengiriman komoditas antarwilayah (FR-02)" />
      <div className="space-y-6 p-5 md:p-8 text-slate-100">
        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-white"><Truck className="h-5 w-5 text-emerald-400" /> Distribusi Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Wilayah Asal" htmlFor="d-asal">
                <Select id="d-asal" required value={form.id_wilayah_asal} onChange={(e) => setForm({ ...form, id_wilayah_asal: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white">
                  <option value="">Pilih wilayah asal…</option>
                  {wilayahList.map((w) => <option key={w.id} value={w.id}>{w.nama_wilayah}</option>)}
                </Select>
              </FormField>
              <FormField label="Wilayah Tujuan" htmlFor="d-tujuan">
                <Select id="d-tujuan" required value={form.id_wilayah_tujuan} onChange={(e) => setForm({ ...form, id_wilayah_tujuan: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white">
                  <option value="">Pilih wilayah tujuan…</option>
                  {wilayahList.map((w) => <option key={w.id} value={w.id}>{w.nama_wilayah}</option>)}
                </Select>
              </FormField>
              <FormField label="Komoditas" htmlFor="d-komoditas">
                <Select id="d-komoditas" required value={form.id_komoditas} onChange={(e) => setForm({ ...form, id_komoditas: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white">
                  <option value="">Pilih komoditas…</option>
                  {komoditasList.map((k) => <option key={k.id} value={k.id}>{k.nama_komoditas}</option>)}
                </Select>
              </FormField>
              <FormField label="Jumlah" htmlFor="d-jumlah">
                <Input id="d-jumlah" type="number" min={0} required value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
              </FormField>
              <FormField label="Tanggal" htmlFor="d-tanggal">
                <Input id="d-tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
              </FormField>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-2.5 shadow-lg shadow-emerald-950/50" loading={submitDistribusi.isPending}>Simpan Distribusi</Button>
            </form>
          </Card>

          <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
            <h2 className="p-5 pb-0 font-bold text-white">Distribusi Anda</h2>
            <div className="overflow-x-auto p-5">
              {distribusiQuery.isLoading ? (
                <LoadingRows />
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                      <th className="pb-3 pr-4">Tanggal</th>
                      <th className="pb-3 pr-4">Rute</th>
                      <th className="pb-3 pr-4">Komoditas</th>
                      <th className="pb-3 pr-4">Jumlah</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {myEntries.map((d) => {
                      const next = nextStatus[d.status];
                      return (
                        <tr key={d.id} className="hover:bg-emerald-950/20 transition">
                          <td className="py-3 pr-4 text-slate-400 text-xs">{d.tanggal}</td>
                          <td className="py-3 pr-4 text-slate-300">{wById.get(d.id_wilayah_asal) ?? d.id_wilayah_asal} → {wById.get(d.id_wilayah_tujuan) ?? d.id_wilayah_tujuan}</td>
                          <td className="py-3 pr-4 text-slate-300">{kById.get(d.id_komoditas)?.nama_komoditas ?? d.id_komoditas}</td>
                          <td className="py-3 pr-4 font-semibold text-emerald-400">{d.jumlah.toLocaleString("id-ID")}</td>
                          <td className="py-3 pr-4"><Badge status={d.status}>{d.status}</Badge></td>
                          <td className="py-3">
                            {next && (
                              <button
                                type="button"
                                onClick={() => updateStatus.mutate({ id: d.id, status: next })}
                                className="rounded-xl bg-emerald-950/50 border border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900 transition"
                              >
                                Tandai {next === "dikirim" ? "Dikirim" : "Selesai"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {myEntries.length === 0 && (
                      <tr><td colSpan={6} className="py-8 text-center text-slate-400">Belum ada distribusi tercatat.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}