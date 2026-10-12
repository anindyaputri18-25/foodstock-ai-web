import { useDataStore } from "@/store/useDataStore";
import {
  DistribusiEntrySchema,
  KomoditasSchema,
  KonsumsiEntrySchema,
  ModelConfigSchema,
  NotifikasiSchema,
  RekomendasiSchema,
  StokEntrySchema,
  UserSchema,
  WilayahSchema,
  type DistribusiEntry,
  type Komoditas,
  type KonsumsiEntry,
  type ModelConfig,
  type Notifikasi,
  type Rekomendasi,
  type Role,
  type StokEntry,
  type User,
  type Wilayah,
} from "@/types/domain";
import { z } from "zod";

/**
 * Lapisan ini meniru pola pemanggilan REST API (delay + validasi Zod di sisi
 * "server") walaupun sumber datanya adalah store Zustand yang dipersist ke
 * localStorage, dijelaskan pada Bab 12 laporan proyek akhir. Setiap fungsi
 * di bawah ini adalah titik yang nantinya tinggal diarahkan ke endpoint REST
 * sungguhan (mis. app/api/*) tanpa mengubah kontrak tipe di lapisan hook.
 */
function delay<T>(value: T, ms = 380): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---- Wilayah & Komoditas ------------------------------------------------
export async function fetchWilayah(): Promise<Wilayah[]> {
  const raw = await delay(useDataStore.getState().wilayah);
  return z.array(WilayahSchema).parse(raw);
}
export async function fetchKomoditas(): Promise<Komoditas[]> {
  const raw = await delay(useDataStore.getState().komoditas);
  return z.array(KomoditasSchema).parse(raw);
}
export async function createWilayah(input: Omit<Wilayah, "id">) {
  useDataStore.getState().addWilayah(input);
  return delay({ ok: true });
}
export async function editWilayah(id: string, patch: Partial<Omit<Wilayah, "id">>) {
  useDataStore.getState().updateWilayah(id, patch);
  return delay({ ok: true });
}
export async function removeWilayah(id: string) {
  useDataStore.getState().deleteWilayah(id);
  return delay({ ok: true });
}
export async function createKomoditas(input: Omit<Komoditas, "id">) {
  useDataStore.getState().addKomoditas(input);
  return delay({ ok: true });
}
export async function editKomoditas(id: string, patch: Partial<Omit<Komoditas, "id">>) {
  useDataStore.getState().updateKomoditas(id, patch);
  return delay({ ok: true });
}
export async function removeKomoditas(id: string) {
  useDataStore.getState().deleteKomoditas(id);
  return delay({ ok: true });
}

// ---- Forecast & Dashboard -------------------------------------------------
export async function fetchForecastResults() {
  return delay(useDataStore.getState().forecastResults);
}
export async function fetchForecastSeries(idWilayah: string, idKomoditas: string) {
  return delay(useDataStore.getState().getForecastSeries(idWilayah, idKomoditas));
}
export async function runForecast(aktor: { nama: string; role: Role }) {
  useDataStore.getState().runForecastAll(aktor);
  return delay({ ok: true }, 900);
}

// ---- Rekomendasi realokasi (FR-06) ----------------------------------------
export async function fetchRekomendasi(): Promise<Rekomendasi[]> {
  const raw = await delay(useDataStore.getState().rekomendasi);
  return z.array(RekomendasiSchema).parse(raw);
}
export async function updateRekomendasiStatus(id: string, status: Rekomendasi["status"]) {
  useDataStore.getState().updateRekomendasiStatus(id, status);
  return delay({ ok: true });
}

// ---- Notifikasi (FR-05 / FR-10) --------------------------------------------
export async function fetchNotifikasi(): Promise<Notifikasi[]> {
  const raw = await delay(useDataStore.getState().notifikasi);
  return z.array(NotifikasiSchema).parse(raw);
}
export async function tindakLanjutNotifikasi(id: string) {
  useDataStore.getState().tindakLanjutNotifikasi(id);
  return delay({ ok: true });
}

// ---- Data historis (FR-02) -------------------------------------------------
export async function fetchStokEntries(): Promise<StokEntry[]> {
  const raw = await delay(useDataStore.getState().stokEntries);
  return z.array(StokEntrySchema).parse(raw);
}
export async function submitStokEntry(input: Omit<StokEntry, "id">) {
  useDataStore.getState().addStokEntry(input);
  return delay({ ok: true });
}
export async function fetchKonsumsiEntries(): Promise<KonsumsiEntry[]> { return delay(useDataStore.getState().konsumsiEntries); }
export async function submitKonsumsiEntry(input: Omit<KonsumsiEntry, "id">) {
  useDataStore.getState().addKonsumsiEntry(input);
  return delay({ ok: true });
}
export async function importHistoricalRows(rows: Array<{ jenis: "stok" | "konsumsi"; id_wilayah: string; id_komoditas: string; jumlah: number; tanggal: string; sumber: "bps_bapanas" }>, aktor: string) {
  return delay(useDataStore.getState().importHistoricalRows(rows, aktor), 100);
}

export async function fetchDistribusiEntries(): Promise<DistribusiEntry[]> {
  const raw = await delay(useDataStore.getState().distribusiEntries);
  return z.array(DistribusiEntrySchema).parse(raw);
}
export async function submitDistribusiEntry(input: Omit<DistribusiEntry, "id">) {
  useDataStore.getState().addDistribusiEntry(input);
  return delay({ ok: true });
}
export async function updateDistribusiStatus(id: string, status: DistribusiEntry["status"]) {
  useDataStore.getState().updateDistribusiStatus(id, status);
  return delay({ ok: true });
}

// ---- Pengguna (Admin, FR-01 manajemen akun) ---------------------------
export async function fetchUsers(): Promise<User[]> {
  const raw = await delay(useDataStore.getState().users);
  return z.array(UserSchema).parse(raw);
}
export async function verifyUserAccount(id: string, approve: boolean) {
  useDataStore.getState().verifyUser(id, approve);
  return delay({ ok: true });
}
export async function changeUserRole(id: string, role: Role) {
  useDataStore.getState().updateUserRole(id, role);
  return delay({ ok: true });
}
export async function toggleLockUserAccount(id: string) {
  useDataStore.getState().toggleLockUser(id);
  return delay({ ok: true });
}
export async function deleteUserAccount(id: string) {
  useDataStore.getState().deleteUser(id);
  return delay({ ok: true });
}

// ---- Audit log (NFR-10) -----------------------------------------------
export async function fetchAuditLog() {
  return delay(useDataStore.getState().auditLog);
}

// ---- Konfigurasi model AI (Admin) --------------------------------------
export async function fetchModelConfig(): Promise<ModelConfig> {
  const raw = await delay(useDataStore.getState().modelConfig);
  return ModelConfigSchema.parse(raw);
}
export async function saveModelConfig(patch: Partial<ModelConfig>) {
  useDataStore.getState().updateModelConfig(patch);
  return delay({ ok: true });
}

// ---- Integrasi pihak ketiga (FR-09), proxy ke Route Handler -----------
export interface WeatherReading {
  source: string;
  status: "live" | "fallback";
  suhu_c: number;
  curah_hujan_mm: number;
  kelembapan_persen: number;
  kategori_musim: string;
  waktu: string;
}
export async function fetchWeather(lat: number, lon: number): Promise<WeatherReading> {
  const res = await fetch(`/api/external/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Gagal memuat data cuaca eksternal.");
  return res.json();
}
