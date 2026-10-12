"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button, Card, FormField, Input, LoadingRows, Select } from "@/components/ui/Basics";
import { Modal } from "@/components/ui/Modal";
import { useKomoditasQuery, useWilayahQuery } from "@/hooks/useQueries";
import { useKomoditasMutations, useWilayahMutations } from "@/hooks/useMutations";
import { useUIStore } from "@/store/useUIStore";
import type { Komoditas, Wilayah } from "@/types/domain";

export default function MasterDataPage() {
  const [tab, setTab] = useState<"wilayah" | "komoditas">("wilayah");

  return (
    <>
      <TopBar title="Manajemen Master Data" subtitle="Referensi data 25 komoditas pangan pokok dan 38 provinsi (FR-08)" />
      <div className="space-y-5 p-5 md:p-8">
        <div className="inline-flex rounded-2xl bg-[#061a14] border border-emerald-900/50 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setTab("wilayah")}
            className={`rounded-xl px-5 py-2 transition ${tab === "wilayah" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
          >
            Wilayah
          </button>
          <button
            type="button"
            onClick={() => setTab("komoditas")}
            className={`rounded-xl px-5 py-2 transition ${tab === "komoditas" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
          >
            Komoditas
          </button>
        </div>
        {tab === "wilayah" ? <WilayahPanel /> : <KomoditasPanel />}
      </div>
    </>
  );
}

function WilayahPanel() {
  const query = useWilayahQuery();
  const { create, update, remove } = useWilayahMutations();
  const showToast = useUIStore((s) => s.showToast);
  const [editing, setEditing] = useState<Wilayah | null>(null);
  const [toDelete, setToDelete] = useState<Wilayah | null>(null);
  const [form, setForm] = useState({ nama_wilayah: "", provinsi: "", latitude: "", longitude: "" });

  const resetForm = () => setForm({ nama_wilayah: "", provinsi: "", latitude: "", longitude: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      nama_wilayah: form.nama_wilayah,
      provinsi: form.provinsi,
      latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0,
    };
    if (editing) {
      update.mutate({ id: editing.id, patch: payload });
      showToast("Data wilayah diperbarui.");
      setEditing(null);
    } else {
      create.mutate(payload);
      showToast("Wilayah baru ditambahkan.");
    }
    resetForm();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <Card className="agri-card p-6 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
          <Plus className="h-4 w-4 text-emerald-400" /> {editing ? "Ubah Wilayah" : "Tambah Wilayah"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nama Wilayah" htmlFor="w-nama">
            <Input id="w-nama" required value={form.nama_wilayah} onChange={(e) => setForm({ ...form, nama_wilayah: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
          </FormField>
          <FormField label="Provinsi" htmlFor="w-provinsi">
            <Input id="w-provinsi" required value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Latitude" htmlFor="w-lat">
              <Input id="w-lat" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
            </FormField>
            <FormField label="Longitude" htmlFor="w-lon">
              <Input id="w-lon" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
            </FormField>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl" loading={create.isPending || update.isPending}>
              {editing ? "Simpan Perubahan" : "Tambah Wilayah"}
            </Button>
            {editing && (
              <Button type="button" variant="ghost" onClick={() => { setEditing(null); resetForm(); }} className="text-slate-400 hover:text-white">
                Batal
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          {query.isLoading ? (
            <div className="p-6"><LoadingRows /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                  <th className="p-4">Nama Wilayah</th>
                  <th className="p-4">Provinsi</th>
                  <th className="p-4">Koordinat</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {(query.data ?? []).map((w) => (
                  <tr key={w.id} className="hover:bg-emerald-950/20 transition">
                    <td className="p-4 font-semibold text-slate-200">{w.nama_wilayah}</td>
                    <td className="p-4 text-slate-400">{w.provinsi}</td>
                    <td className="p-4 text-xs text-slate-400">{w.latitude.toFixed(2)}, {w.longitude.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(w);
                            setForm({ nama_wilayah: w.nama_wilayah, provinsi: w.provinsi, latitude: String(w.latitude), longitude: String(w.longitude) });
                          }}
                          className="rounded-xl bg-emerald-950/60 p-2 text-emerald-400 hover:bg-emerald-900 border border-emerald-900/50 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setToDelete(w)} className="rounded-xl bg-rose-950/40 p-2 text-rose-400 hover:bg-rose-900/50 border border-rose-900/50 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Hapus Wilayah">
        <p className="text-sm text-slate-300">
          Yakin ingin menghapus wilayah <strong className="text-white">{toDelete?.nama_wilayah}</strong>? Data historis terkait tidak otomatis terhapus.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setToDelete(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-emerald-950">Batal</button>
          <button
            type="button"
            onClick={() => { if (toDelete) remove.mutate(toDelete.id); setToDelete(null); }}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 shadow-md"
          >
            Ya, Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}

function KomoditasPanel() {
  const query = useKomoditasQuery();
  const { create, update, remove } = useKomoditasMutations();
  const showToast = useUIStore((s) => s.showToast);
  const [editing, setEditing] = useState<Komoditas | null>(null);
  const [toDelete, setToDelete] = useState<Komoditas | null>(null);
  const [form, setForm] = useState({ nama_komoditas: "", kategori: "pokok", satuan: "ton", ambang_batas: "" });

  const resetForm = () => setForm({ nama_komoditas: "", kategori: "pokok", satuan: "ton", ambang_batas: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      nama_komoditas: form.nama_komoditas,
      kategori: form.kategori as Komoditas["kategori"],
      satuan: form.satuan as Komoditas["satuan"],
      ambang_batas: Number(form.ambang_batas) || 0,
    };
    if (editing) {
      update.mutate({ id: editing.id, patch: payload });
      showToast("Data komoditas diperbarui.");
      setEditing(null);
    } else {
      create.mutate(payload);
      showToast("Komoditas baru ditambahkan.");
    }
    resetForm();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <Card className="agri-card p-6 border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
          <Plus className="h-4 w-4 text-emerald-400" /> {editing ? "Ubah Komoditas" : "Tambah Komoditas"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nama Komoditas" htmlFor="k-nama">
            <Input id="k-nama" required value={form.nama_komoditas} onChange={(e) => setForm({ ...form, nama_komoditas: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
          </FormField>
          <FormField label="Kategori" htmlFor="k-kategori">
            <Select id="k-kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white">
              <option value="pokok">Pokok</option>
              <option value="hortikultura">Hortikultura</option>
              <option value="protein">Protein</option>
              <option value="lainnya">Lainnya</option>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Satuan" htmlFor="k-satuan">
              <Select id="k-satuan" value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white">
                <option value="ton">Ton</option>
                <option value="kg">Kg</option>
                <option value="kuintal">Kuintal</option>
              </Select>
            </FormField>
            <FormField label="Ambang Batas" htmlFor="k-ambang">
              <Input id="k-ambang" type="number" required value={form.ambang_batas} onChange={(e) => setForm({ ...form, ambang_batas: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
            </FormField>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl" loading={create.isPending || update.isPending}>
              {editing ? "Simpan Perubahan" : "Tambah Komoditas"}
            </Button>
            {editing && (
              <Button type="button" variant="ghost" onClick={() => { setEditing(null); resetForm(); }} className="text-slate-400 hover:text-white">
                Batal
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          {query.isLoading ? (
            <div className="p-6"><LoadingRows /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                  <th className="p-4">Nama Komoditas</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Satuan</th>
                  <th className="p-4">Ambang Batas</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {(query.data ?? []).map((k) => (
                  <tr key={k.id} className="hover:bg-emerald-950/20 transition">
                    <td className="p-4 font-semibold text-slate-200">{k.nama_komoditas}</td>
                    <td className="p-4 capitalize text-slate-400">{k.kategori}</td>
                    <td className="p-4 text-slate-400">{k.satuan}</td>
                    <td className="p-4 text-slate-300">{k.ambang_batas.toLocaleString("id-ID")}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(k);
                            setForm({ nama_komoditas: k.nama_komoditas, kategori: k.kategori, satuan: k.satuan, ambang_batas: String(k.ambang_batas) });
                          }}
                          className="rounded-xl bg-emerald-950/60 p-2 text-emerald-400 hover:bg-emerald-900 border border-emerald-900/50 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setToDelete(k)} className="rounded-xl bg-rose-950/40 p-2 text-rose-400 hover:bg-rose-900/50 border border-rose-900/50 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Hapus Komoditas">
        <p className="text-sm text-slate-300">
          Yakin ingin menghapus komoditas <strong className="text-white">{toDelete?.nama_komoditas}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setToDelete(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-emerald-950">Batal</button>
          <button
            type="button"
            onClick={() => { if (toDelete) remove.mutate(toDelete.id); setToDelete(null); }}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 shadow-md"
          >
            Ya, Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}