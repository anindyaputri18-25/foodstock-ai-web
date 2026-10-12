"use client";

import { useState, type FormEvent } from "react";
import { Save, Upload, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { TopBar } from "@/components/layout/TopBar";
import { Badge, Button, Card, FormField, Input, LoadingRows, Select } from "@/components/ui/Basics";
import { useKomoditasQuery, useStokEntriesQuery, useWilayahQuery, useKonsumsiEntriesQuery, useForecastResultsQuery } from "@/hooks/useQueries";
import { useSubmitKonsumsiMutation, useSubmitStokMutation, useImportHistoricalMutation } from "@/hooks/useMutations";
import { useSessionStore } from "@/store/useSessionStore";
import { useDataStore } from "@/store/useDataStore";
import { useUIStore } from "@/store/useUIStore";

export default function InputStokPage() {
  const wilayahQuery = useWilayahQuery();
  const komoditasQuery = useKomoditasQuery();
  const stokQuery = useStokEntriesQuery();
  const konsumsiQuery = useKonsumsiEntriesQuery();
  const forecastQuery = useForecastResultsQuery();
  const submitStok = useSubmitStokMutation();
  const submitKonsumsi = useSubmitKonsumsiMutation();
  const importHistorical = useImportHistoricalMutation();
  const [importReport, setImportReport] = useState<{ tersimpan: number; diperbarui: number; gagal: Array<{ baris: number; alasan: string }> } | null>(null);
  const [importing, setImporting] = useState(false);
  const session = useSessionStore((s) => s.session);
  const updateStokEntry = useDataStore((s) => s.updateStokEntry);
  const deleteStokEntry = useDataStore((s) => s.deleteStokEntry);
  const updateKonsumsiEntry = useDataStore((s) => s.updateKonsumsiEntry);
  const deleteKonsumsiEntry = useDataStore((s) => s.deleteKonsumsiEntry);
  const showToast = useUIStore((s) => s.showToast);

  const wilayahList = wilayahQuery.data ?? [];
  const komoditasList = komoditasQuery.data ?? [];

  const [tab, setTab] = useState<"stok" | "konsumsi">("stok");
  const [form, setForm] = useState({ id_wilayah: "", id_komoditas: "", jumlah: "", tanggal: new Date().toISOString().slice(0, 10) });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.id_wilayah || !form.id_komoditas || !form.jumlah) return;
    if (tab === "stok") {
      submitStok.mutate(
        {
          id_wilayah: form.id_wilayah,
          id_komoditas: form.id_komoditas,
          jumlah: Number(form.jumlah),
          tanggal: form.tanggal,
          sumber: "manual",
          dicatatOleh: session?.nama ?? "Petugas Dinas",
        },
        { onSuccess: () => showToast("Data stok tersimpan.") },
      );
    } else {
      submitKonsumsi.mutate(
        { id_wilayah: form.id_wilayah, id_komoditas: form.id_komoditas, jumlah: Number(form.jumlah), periode: form.tanggal.slice(0, 7) },
        { onSuccess: () => showToast("Data konsumsi tersimpan.") },
      );
    }
    setForm({ ...form, jumlah: "" });
  };

  const wById = new Map(wilayahList.map((w) => [w.id, w.nama_wilayah]));
  const kById = new Map(komoditasList.map((k) => [k.id, k]));

  return (
    <>
      <TopBar title="Input Data Stok & Konsumsi" subtitle="Pencatatan manual data stok dan konsumsi pangan per wilayah (FR-02)" />
      <div className="space-y-6 px-5 pt-5 md:px-8 text-slate-100">
        <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-white"><FileSpreadsheet className="h-5 w-5 text-emerald-400" /> Impor Data Awal BPS / Bapanas</h2>
              <p className="mt-1 text-sm text-slate-400">Unggah CSV atau Excel (.xlsx/.xls). Baris dicocokkan berdasarkan nama/ID wilayah dan komoditas.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => {
              const rows = [["jenis","wilayah","komoditas","jumlah","tanggal"],["stok","Jawa Timur","Beras Medium",1200,"2026-01-01"],["konsumsi","Jawa Timur","Beras Medium",950,"2026-01"]];
              const ws = XLSX.utils.aoa_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Data Historis"); XLSX.writeFile(wb, "template_impor_foodstock.xlsx");
            }} className="border-emerald-800 text-emerald-300 hover:bg-emerald-950 rounded-xl"><Download className="h-4 w-4" /> Unduh Templat</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input type="file" accept=".csv,.xlsx,.xls" className="block max-w-full text-sm file:mr-3 file:rounded-xl file:border file:border-emerald-800 file:bg-emerald-950/50 file:px-4 file:py-2 file:font-semibold file:text-emerald-300 text-slate-300" disabled={importing} onChange={async (ev) => {
              const file = ev.target.files?.[0]; if (!file) return;
              setImportReport(null); setImporting(true);
              try {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: "array", cellDates: true }) as XLSX.WorkBook;
                const sheetName = workbook.SheetNames[0];
                if (!sheetName) throw new Error("File Excel tidak memiliki sheet.");
                const sheet = workbook.Sheets[sheetName];
                const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet!, { defval: "" });
                const normalize = (v: unknown) => String(v ?? "").trim();
                const rows = records.map((r) => {
                  const fields: Record<string, unknown> = {};
                  Object.entries(r).forEach(([key, value]) => { fields[key.toLowerCase().trim().replace(/[ _-]/g, "")] = value; });
                  const get = (...keys: string[]) => { for (const key of keys) if (fields[key] !== undefined && fields[key] !== "") return fields[key]; return ""; };
                  const rawDate = get("tanggal", "periode", "bulan", "tahunbulan");
                  let date = rawDate instanceof Date ? rawDate.toISOString().slice(0,10) : normalize(rawDate);
                  if (typeof rawDate === "number") date = XLSX.SSF.format("yyyy-mm-dd", rawDate);
                  return { jenis: normalize(get("jenis", "tipe", "kategori")).toLowerCase() === "konsumsi" ? "konsumsi" as const : "stok" as const, id_wilayah: normalize(get("wilayah", "namawilayah", "idwilayah", "provinsi")), id_komoditas: normalize(get("komoditas", "namakomoditas", "idkomoditas")), jumlah: Number(get("jumlah", "nilai", "kuantitas")), tanggal: date.slice(0,10).length === 10 ? date.slice(0,10) : date.slice(0,7), sumber: "bps_bapanas" as const };
                });
                if (!rows.length) throw new Error("File tidak berisi baris data.");
                const report = await importHistorical.mutateAsync({ rows, aktor: session?.nama ?? "Admin" });
                setImportReport(report);
                showToast(`Impor selesai: ${report.tersimpan} tersimpan, ${report.diperbarui} diperbarui, ${report.gagal.length} gagal.`);
              } catch (error) { showToast(error instanceof Error ? error.message : "File gagal dibaca."); }
              finally { setImporting(false); ev.target.value = ""; }
            }} />
            {importing && <span className="text-sm text-emerald-400">Membaca dan memvalidasi file…</span>}
          </div>
          <p className="mt-2 text-xs text-slate-400">Kolom wajib: jenis (stok/konsumsi), wilayah, komoditas, jumlah, tanggal/periode. Bulan gunakan format YYYY-MM.</p>
          {importReport && <div className="mt-4 rounded-xl border border-emerald-900/50 bg-[#051410] p-4 text-sm text-slate-300">
            <h3 className="font-bold text-white">Laporan hasil impor</h3>
            <div className="mt-2 flex flex-wrap gap-4"><span className="text-emerald-400">Tersimpan: {importReport.tersimpan}</span><span className="text-sky-400">Diperbarui: {importReport.diperbarui}</span><span className="text-rose-400">Gagal: {importReport.gagal.length}</span></div>
            {importReport.gagal.length > 0 && <div className="mt-3 max-h-48 overflow-auto"><table className="w-full text-left"><thead><tr className="border-b border-emerald-900/40 text-xs uppercase text-slate-400"><th className="p-2">Baris</th><th className="p-2">Alasan</th></tr></thead><tbody>{importReport.gagal.map((e,i) => <tr key={`${e.baris}-${i}`} className="border-t border-emerald-900/20"><td className="p-2">{e.baris}</td><td className="p-2 text-rose-300">{e.alasan}</td></tr>)}</tbody></table></div>}
          </div>}
        </Card>

        <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
          <h2 className="font-bold text-white">Kelengkapan Data Historis</h2>
          <p className="mt-1 text-sm text-slate-400">Pemeriksaan 30 bulan terakhir. Kombinasi ditandai jika data konsumsi kurang dari 30 bulan atau ada bulan yang kosong.</p>
          {(() => {
            const end = new Date(); end.setDate(1);
            const months = Array.from({ length: 30 }, (_, i) => { const d = new Date(end.getFullYear(), end.getMonth() - 29 + i, 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; });
            const rows = wilayahList.flatMap((w) => komoditasList.map((k) => {
              const found = new Set((konsumsiQuery.data ?? []).filter((r) => r.id_wilayah === w.id && r.id_komoditas === k.id).map((r) => r.periode));
              const missing = months.filter((m) => !found.has(m));
              return { key: `${w.id}-${k.id}`, wilayah: w.nama_wilayah, komoditas: k.nama_komoditas, count: months.length - missing.length, missing };
            })).filter((r) => r.count < 30 || r.missing.length > 0);
            return rows.length ? <div className="mt-4 max-h-80 overflow-auto"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-[#081c16] text-xs uppercase text-slate-400 border-b border-emerald-900/40"><tr><th className="p-2">Wilayah</th><th className="p-2">Komoditas</th><th className="p-2">Bulan tersedia</th><th className="p-2">Bulan kosong</th></tr></thead><tbody>{rows.map((r) => <tr key={r.key} className="border-t border-emerald-900/20 align-top text-slate-300"><td className="p-2">{r.wilayah}</td><td className="p-2">{r.komoditas}</td><td className="p-2">{r.count}/30</td><td className="max-w-lg p-2 text-amber-300">{r.missing.join(", ")}</td></tr>)}</tbody></table></div> : <p className="py-6 text-center text-sm text-emerald-400 font-semibold">Semua kombinasi memiliki data lengkap selama 30 bulan.</p>;
          })()}
          {(konsumsiQuery.data ?? []).length === 0 && <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-sm text-amber-300">Belum ada data konsumsi historis. Impor data awal BPS/Bapanas di atas sebelum menjalankan forecast.</p>}
          {(forecastQuery.data ?? []).length === 0 && <p className="mt-2 text-xs text-slate-400">Belum ada hasil forecast. Setelah impor data, Admin dapat menjalankannya dari Dashboard Admin atau halaman Model AI.</p>}
        </Card>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <Card className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-6">
            <div className="mb-4 inline-flex rounded-xl bg-[#051410] border border-emerald-900/50 p-1 text-sm font-semibold">
              <button type="button" onClick={() => setTab("stok")} className={`rounded-lg px-4 py-1.5 transition ${tab === "stok" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>Stok</button>
              <button type="button" onClick={() => setTab("konsumsi")} className={`rounded-lg px-4 py-1.5 transition ${tab === "konsumsi" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>Konsumsi</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Wilayah" htmlFor="is-wilayah">
                <Select id="is-wilayah" required value={form.id_wilayah} onChange={(e) => setForm({ ...form, id_wilayah: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white">
                  <option value="">Pilih wilayah…</option>
                  {wilayahList.map((w) => <option key={w.id} value={w.id}>{w.nama_wilayah}</option>)}
                </Select>
              </FormField>
              <FormField label="Komoditas" htmlFor="is-komoditas">
                <Select id="is-komoditas" required value={form.id_komoditas} onChange={(e) => setForm({ ...form, id_komoditas: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white">
                  <option value="">Pilih komoditas…</option>
                  {komoditasList.map((k) => <option key={k.id} value={k.id}>{k.nama_komoditas}</option>)}
                </Select>
              </FormField>
              <FormField label={tab === "stok" ? "Jumlah Stok" : "Jumlah Konsumsi (per bulan)"} htmlFor="is-jumlah">
                <Input id="is-jumlah" type="number" min={0} required value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
              </FormField>
              <FormField label="Tanggal" htmlFor="is-tanggal">
                <Input id="is-tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="bg-[#051410] border-emerald-900/50 text-white" />
              </FormField>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-2.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2" loading={submitStok.isPending || submitKonsumsi.isPending}>
                <Save className="h-4 w-4" /> Simpan Data
              </Button>
            </form>
          </Card>

          <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden">
            <h2 className="p-5 pb-0 font-bold text-white">Riwayat Input Stok Terbaru</h2>
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
                      <th className="pb-3 pr-4">Sumber</th>
                      <th className="pb-3 pr-4">Dicatat Oleh</th>
                      <th className="pb-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/20">
                    {(stokQuery.data ?? []).slice(0, 15).map((e) => (
                      <tr key={e.id} className="hover:bg-emerald-950/20 transition">
                        <td className="py-3 pr-4 text-xs text-slate-400">{e.tanggal}</td>
                        <td className="py-3 pr-4 text-slate-300">{wById.get(e.id_wilayah) ?? e.id_wilayah}</td>
                        <td className="py-3 pr-4 text-slate-300">{kById.get(e.id_komoditas)?.nama_komoditas ?? e.id_komoditas}</td>
                        <td className="py-3 pr-4 font-semibold text-emerald-400">{e.jumlah.toLocaleString("id-ID")} {kById.get(e.id_komoditas)?.satuan}</td>
                        <td className="py-3 pr-4"><span className={`inline-flex rounded-xl px-2.5 py-1 text-xs font-semibold ${e.sumber === "bps_bapanas" ? "bg-sky-950/50 text-sky-300 border border-sky-800" : e.sumber === "simulasi" ? "bg-amber-950/50 text-amber-300 border border-amber-800" : "bg-emerald-950/50 text-emerald-300 border border-emerald-800"}`}>{e.sumber}</span></td>
                        <td className="py-3 pr-4 text-xs text-slate-400">{e.dicatatOleh}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300" onClick={() => { const value = window.prompt("Jumlah stok baru", String(e.jumlah)); if (value !== null && value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 && window.confirm("Simpan perubahan stok ini?")) updateStokEntry(e.id, { jumlah: Number(value) }, session?.nama ?? "Admin"); }}>Edit</button>
                            <button className="text-xs font-semibold text-rose-400 hover:text-rose-300" onClick={() => { if (window.confirm("Yakin ingin menghapus data stok ini? Tindakan akan dicatat di audit log.")) deleteStokEntry(e.id, session?.nama ?? "Admin"); }}>Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        <Card padding="none" className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl overflow-hidden pb-4">
          <h2 className="p-5 pb-0 font-bold text-white">Riwayat Konsumsi dan Sumber Data</h2>
          <div className="overflow-x-auto p-5">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-900/30 text-xs uppercase text-slate-400 bg-emerald-950/20">
                  <th className="p-3">Periode</th>
                  <th className="p-3">Wilayah</th>
                  <th className="p-3">Komoditas</th>
                  <th className="p-3">Jumlah</th>
                  <th className="p-3">Sumber</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {(konsumsiQuery.data ?? []).slice(0, 30).map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-950/20 transition">
                    <td className="p-3 text-xs text-slate-400">{r.periode}</td>
                    <td className="p-3 text-slate-300">{wById.get(r.id_wilayah) ?? r.id_wilayah}</td>
                    <td className="p-3 text-slate-300">{kById.get(r.id_komoditas)?.nama_komoditas ?? r.id_komoditas}</td>
                    <td className="p-3 font-semibold text-emerald-400">{r.jumlah.toLocaleString("id-ID")} {kById.get(r.id_komoditas)?.satuan}</td>
                    <td className="p-3"><span className={`inline-flex rounded-xl px-2.5 py-1 text-xs font-semibold ${(r.sumber ?? "manual") === "bps_bapanas" ? "bg-sky-950/50 text-sky-300 border border-sky-800" : r.sumber === "simulasi" ? "bg-amber-950/50 text-amber-300 border border-amber-800" : "bg-emerald-950/50 text-emerald-300 border border-emerald-800"}`}>{r.sumber ?? "manual"}</span></td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300" onClick={() => { const value = window.prompt("Jumlah konsumsi baru", String(r.jumlah)); if (value !== null && value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 && window.confirm("Simpan perubahan konsumsi ini?")) updateKonsumsiEntry(r.id, { jumlah: Number(value) }, session?.nama ?? "Admin"); }}>Edit</button>
                        <button className="text-xs font-semibold text-rose-400 hover:text-rose-300" onClick={() => { if (window.confirm("Yakin ingin menghapus data konsumsi ini? Tindakan akan dicatat di audit log.")) deleteKonsumsiEntry(r.id, session?.nama ?? "Admin"); }}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(konsumsiQuery.data ?? []).length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-400">Belum ada data konsumsi. Impor data BPS/Bapanas melalui panel impor di bagian atas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}