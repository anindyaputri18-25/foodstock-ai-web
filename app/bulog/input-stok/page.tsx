"use client";

import { useState, type FormEvent } from "react";
import { PackagePlus } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button, Card, FormField, Input, LoadingRows, Select } from "@/components/ui/Basics";
import { useKomoditasQuery, useStokEntriesQuery, useWilayahQuery } from "@/hooks/useQueries";
import { useSubmitStokMutation } from "@/hooks/useMutations";
import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";

export default function BulogInputStokPage() {
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const stokQuery = useStokEntriesQuery();
  const submitStok = useSubmitStokMutation();
  const session = useSessionStore((s) => s.session);
  const showToast = useUIStore((s) => s.showToast);

  const wilayahList = wilayahQuery.data ?? [];
  const komoditasList = komoditasQuery.data ?? [];
  const [form, setForm] = useState({ id_wilayah: "", id_komoditas: "", jumlah: "", tanggal: new Date().toISOString().slice(0, 10) });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.id_wilayah || !form.id_komoditas || !form.jumlah) return;
    submitStok.mutate(
      {
        id_wilayah: form.id_wilayah,
        id_komoditas: form.id_komoditas,
        jumlah: Number(form.jumlah),
        tanggal: form.tanggal,
        sumber: "gudang_bulog",
        dicatatOleh: session?.nama ?? "Petugas Bulog",
      },
      { onSuccess: () => showToast("Stok gudang diperbarui.") },
    );
    setForm({ ...form, jumlah: "" });
  };

  const wById = new Map(wilayahList.map((w) => [w.id, w.nama_wilayah]));
  const kById = new Map(komoditasList.map((k) => [k.id, k]));
  const gudangEntries = (stokQuery.data ?? []).filter((e) => e.sumber === "gudang_bulog");

  return (
    <>
      <TopBar title="Input & Update Stok Gudang" subtitle="Pencatatan stok cadangan gudang Bulog per wilayah (FR-02)" />
      <div className="grid gap-5 p-5 md:p-8 lg:grid-cols-[380px_1fr]">
        <Card className="agri-card p-6 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
            <PackagePlus className="h-4.5 w-4.5 text-emerald-400" /> Update Stok Gudang
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Wilayah Gudang" htmlFor="bg-wilayah">
              <Select id="bg-wilayah" required value={form.id_wilayah} onChange={(e) => setForm({ ...form, id_wilayah: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white">
                <option value="" className="bg-[#061a14] text-white">Pilih wilayah…</option>
                {wilayahList.map((w) => <option key={w.id} value={w.id} className="bg-[#061a14] text-white">{w.nama_wilayah}</option>)}
              </Select>
            </FormField>
            <FormField label="Komoditas" htmlFor="bg-komoditas">
              <Select id="bg-komoditas" required value={form.id_komoditas} onChange={(e) => setForm({ ...form, id_komoditas: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white">
                <option value="" className="bg-[#061a14] text-white">Pilih komoditas…</option>
                {komoditasList.map((k) => <option key={k.id} value={k.id} className="bg-[#061a14] text-white">{k.nama_komoditas}</option>)}
              </Select>
            </FormField>
            <FormField label="Jumlah Stok Terbaru" htmlFor="bg-jumlah">
              <Input id="bg-jumlah" type="number" min={0} required value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" placeholder="0" />
            </FormField>
            <FormField label="Tanggal" htmlFor="bg-tanggal">
              <Input id="bg-tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
            </FormField>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-2.5 mt-2 shadow-md shadow-emerald-950/40" loading={submitStok.isPending}>
              Simpan Stok Gudang
            </Button>
          </form>
        </Card>

        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
          <h2 className="p-5 pb-0 font-bold text-white">Riwayat Update Stok Gudang</h2>
          <div className="overflow-x-auto p-5">
            {stokQuery.isLoading ? (
              <LoadingRows />
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                    <th className="pb-3 pr-4">Tanggal</th>
                    <th className="pb-3 pr-4">Wilayah</th>
                    <th className="pb-3 pr-4">Komoditas</th>
                    <th className="pb-3 pr-4">Jumlah</th>
                    <th className="pb-3">Dicatat Oleh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/20">
                  {gudangEntries.slice(0, 15).map((e) => (
                    <tr key={e.id} className="hover:bg-emerald-950/20 transition">
                      <td className="py-3 pr-4 text-slate-400 text-xs">{e.tanggal}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-200">{wById.get(e.id_wilayah) ?? e.id_wilayah}</td>
                      <td className="py-3 pr-4 text-slate-300">{kById.get(e.id_komoditas)?.nama_komoditas ?? e.id_komoditas}</td>
                      <td className="py-3 pr-4 font-bold text-emerald-400">{e.jumlah.toLocaleString("id-ID")} {kById.get(e.id_komoditas)?.satuan}</td>
                      <td className="py-3 text-slate-400 text-xs">{e.dicatatOleh}</td>
                    </tr>
                  ))}
                  {gudangEntries.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-400">Belum ada input stok gudang.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}