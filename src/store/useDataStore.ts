import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_USERS, SEED_KOMODITAS, SEED_WILAYAH } from "@/lib/mock-data";
import { runForecastSimulation, jarakAntarWilayahKm } from "@/lib/forecast";
import type {
  ForecastSeriesPoint,
  AuditLogEntry,
  DistribusiEntry,
  HasilForecast,
  Komoditas,
  KonsumsiEntry,
  ModelConfig,
  Notifikasi,
  Rekomendasi,
  Role,
  StokEntry,
  User,
  UserStatus,
  Wilayah,
} from "@/types/domain";

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface DataState {
  hydrated: boolean;
  users: User[];
  wilayah: Wilayah[];
  komoditas: Komoditas[];
  stokEntries: StokEntry[];
  konsumsiEntries: KonsumsiEntry[];
  distribusiEntries: DistribusiEntry[];
  forecastResults: HasilForecast[];
  forecastSeriesCache: Record<string, ReturnType<typeof runForecastSimulation>["series"]>;
  rekomendasi: Rekomendasi[];
  notifikasi: Notifikasi[];
  auditLog: AuditLogEntry[];
  modelConfig: ModelConfig;
  lastForecastRun: string | null;

  setHydrated: () => void;
  seedIfEmpty: () => void;

  // Auth / users (FR-01, Admin - Kelola Manajemen Pengguna)
  registerUser: (input: Omit<User, "id" | "status" | "percobaanGagal" | "createdAt">) => User;
  verifyUser: (userId: string, approve: boolean) => void;
  updateUserRole: (userId: string, role: Role) => void;
  toggleLockUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  recordLoginAttempt: (email: string, success: boolean) => void;

  // Wilayah & Komoditas (FR-08)
  addWilayah: (w: Omit<Wilayah, "id">) => void;
  updateWilayah: (id: string, patch: Partial<Omit<Wilayah, "id">>) => void;
  deleteWilayah: (id: string) => void;
  addKomoditas: (k: Omit<Komoditas, "id">) => void;
  updateKomoditas: (id: string, patch: Partial<Omit<Komoditas, "id">>) => void;
  deleteKomoditas: (id: string) => void;

  // Data historis (FR-02)
  addStokEntry: (e: Omit<StokEntry, "id">) => void;
  updateStokEntry: (entryId: string, patch: Partial<Omit<StokEntry, "id">>, aktor: string) => void;
  deleteStokEntry: (entryId: string, aktor: string) => void;
  updateKonsumsiEntry: (entryId: string, patch: Partial<Omit<KonsumsiEntry, "id">>, aktor: string) => void;
  deleteKonsumsiEntry: (entryId: string, aktor: string) => void;
  saveNotificationFollowup: (entryId: string, aktor: string, catatan: string, hasil: string) => void;
  importHistoricalRows: (rows: Array<{ jenis: "stok" | "konsumsi"; id_wilayah: string; id_komoditas: string; jumlah: number; tanggal: string; sumber: "bps_bapanas" }>, aktor: string) => { tersimpan: number; diperbarui: number; gagal: Array<{ baris: number; alasan: string }> };
  addKonsumsiEntry: (e: Omit<KonsumsiEntry, "id">) => void;
  addDistribusiEntry: (e: Omit<DistribusiEntry, "id">) => void;
  updateDistribusiStatus: (id: string, status: DistribusiEntry["status"]) => void;

  // Forecasting & Early Warning (FR-03, FR-05, FR-06)
  runForecastAll: (aktor: { nama: string; role: Role }) => void;
  getForecastSeries: (idWilayah: string, idKomoditas: string) => ForecastSeriesPoint[];
  updateRekomendasiStatus: (id: string, status: Rekomendasi["status"]) => void;

  // Notifikasi (FR-10)
  tindakLanjutNotifikasi: (id: string) => void;
  retryEmailNotification: (id: string, aktor: string) => void;

  // Audit (NFR-10)
  addAuditLog: (aktor: string, aktorRole: Role, aksi: string, target: string) => void;

  // Model config (Admin)
  updateModelConfig: (patch: Partial<ModelConfig>) => void;
}

function stokAwalUntuk(idWilayah: string, idKomoditas: string, ambangBatas: number): number {
  // Nilai awal deterministik per kombinasi, berputar di sekitar ambang batas.
  const seedStr = `stok:${idWilayah}:${idKomoditas}`;
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  const factor = 0.6 + (h % 100) / 100; // 0.6x - 1.6x ambang batas
  return Math.round(ambangBatas * factor);
}

function kebutuhanHarianUntuk(ambangBatas: number, idWilayah: string): number {
  const seedStr = `kebutuhan:${idWilayah}`;
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 17 + seedStr.charCodeAt(i)) >>> 0;
  const factor = 0.03 + (h % 40) / 1000; // ~3%-7% ambang batas per hari
  return Math.max(1, Math.round(ambangBatas * factor));
}

/** Entri stok & konsumsi simulasi untuk kombinasi wilayah x komoditas yang diberikan. */
function buatSeedEntries(wilayahList: Wilayah[], komoditasList: Komoditas[]) {
  const stokEntries: StokEntry[] = [];
  const konsumsiEntries: KonsumsiEntry[] = [];
  for (const w of wilayahList) {
    for (const k of komoditasList) {
      const stokAwal = stokAwalUntuk(w.id, k.id, k.ambang_batas);
      const kebutuhanHarian = kebutuhanHarianUntuk(k.ambang_batas, w.id);
      stokEntries.push({
        id: id("stok"),
        id_wilayah: w.id,
        id_komoditas: k.id,
        jumlah: stokAwal,
        tanggal: nowIso().slice(0, 10),
        sumber: "simulasi",
        dicatatOleh: "Seed Simulasi Sistem",
      });
      konsumsiEntries.push({
        id: id("konsumsi"),
        id_wilayah: w.id,
        id_komoditas: k.id,
        jumlah: kebutuhanHarian * 30,
        periode: nowIso().slice(0, 7),
        sumber: "simulasi",
      });
    }
  }
  return { stokEntries, konsumsiEntries };
}

// Versi skema penyimpanan. v1 = master data 38 provinsi x 25 komoditas.
const STORE_VERSION = 1;
// Diset oleh migrate() bila master data diperluas; forecast dihitung ulang setelah hidrasi.
let masterDataDiperluas = false;

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      users: [],
      wilayah: [],
      komoditas: [],
      stokEntries: [],
      konsumsiEntries: [],
      distribusiEntries: [],
      forecastResults: [],
      forecastSeriesCache: {},
      rekomendasi: [],
      notifikasi: [],
      auditLog: [],
      modelConfig: {
        threshold_shortage_persen: 15,
        threshold_surplus_persen: 30,
        horizon_hari: 30,
        mape_current: 7.4,
        last_trained: nowIso(),
        status_model: "aktif",
      },
      lastForecastRun: null,

      setHydrated: () => set({ hydrated: true }),

      seedIfEmpty: () => {
        const s = get();
        if (s.users.length > 0) return;

        const { stokEntries, konsumsiEntries } = buatSeedEntries(SEED_WILAYAH, SEED_KOMODITAS);

        set({
          users: DEMO_USERS,
          wilayah: SEED_WILAYAH,
          komoditas: SEED_KOMODITAS,
          stokEntries,
          konsumsiEntries,
          auditLog: [
            {
              id: id("audit"),
              aktor: "System",
              aktorRole: "admin",
              aksi: "Inisialisasi data master & akun demo",
              target: "Seluruh entitas",
              waktu: nowIso(),
            },
          ],
        });

        get().runForecastAll({ nama: "System", role: "admin" });
      },

      // ---------------- Users ----------------
      registerUser: (input) => {
        const newUser: User = {
          ...input,
          id: id("user"),
          status: "pending",
          percobaanGagal: 0,
          createdAt: nowIso(),
        };
        set((s) => ({ users: [...s.users, newUser] }));
        get().addAuditLog(input.nama, input.role, "Registrasi akun baru (menunggu verifikasi)", input.email);
        return newUser;
      },
      verifyUser: (userId, approve) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, status: (approve ? "aktif" : "ditolak") as UserStatus } : u,
          ),
        }));
        const target = get().users.find((u) => u.id === userId);
        get().addAuditLog("Administrator", "admin", approve ? "Verifikasi & aktivasi akun" : "Menolak registrasi akun", target?.email ?? userId);
      },
      updateUserRole: (userId, role) => {
        set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, role } : u)) }));
        get().addAuditLog("Administrator", "admin", `Mengubah role pengguna menjadi ${role}`, userId);
      },
      toggleLockUser: (userId) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId
              ? { ...u, status: (u.status === "terkunci" ? "aktif" : "terkunci") as UserStatus, percobaanGagal: 0 }
              : u,
          ),
        }));
      },
      deleteUser: (userId) => {
        set((s) => ({ users: s.users.filter((u) => u.id !== userId) }));
        get().addAuditLog("Administrator", "admin", "Menghapus akun pengguna", userId);
      },
      recordLoginAttempt: (email, success) => {
        set((s) => ({
          users: s.users.map((u) => {
            if (u.email !== email) return u;
            if (success) return { ...u, percobaanGagal: 0 };
            const percobaanGagal = u.percobaanGagal + 1;
            // NFR-01: 5x gagal -> akun dikunci sementara.
            return { ...u, percobaanGagal, status: percobaanGagal >= 5 ? ("terkunci" as UserStatus) : u.status };
          }),
        }));
      },

      // ---------------- Wilayah & Komoditas ----------------
      addWilayah: (w) => {
        set((s) => ({ wilayah: [...s.wilayah, { ...w, id: id("wilayah") }] }));
        get().addAuditLog("Administrator", "admin", "Menambah data master wilayah", w.nama_wilayah);
      },
      updateWilayah: (wid, patch) => {
        set((s) => ({ wilayah: s.wilayah.map((w) => (w.id === wid ? { ...w, ...patch } : w)) }));
        get().addAuditLog("Administrator", "admin", "Mengubah data master wilayah", wid);
      },
      deleteWilayah: (wid) => {
        set((s) => ({ wilayah: s.wilayah.filter((w) => w.id !== wid) }));
        get().addAuditLog("Administrator", "admin", "Menghapus data master wilayah", wid);
      },
      addKomoditas: (k) => {
        set((s) => ({ komoditas: [...s.komoditas, { ...k, id: id("komoditas") }] }));
        get().addAuditLog("Administrator", "admin", "Menambah data master komoditas", k.nama_komoditas);
      },
      updateKomoditas: (kid, patch) => {
        set((s) => ({ komoditas: s.komoditas.map((k) => (k.id === kid ? { ...k, ...patch } : k)) }));
        get().addAuditLog("Administrator", "admin", "Mengubah data master komoditas", kid);
      },
      deleteKomoditas: (kid) => {
        set((s) => ({ komoditas: s.komoditas.filter((k) => k.id !== kid) }));
        get().addAuditLog("Administrator", "admin", "Menghapus data master komoditas", kid);
      },

      // ---------------- Data historis (FR-02) ----------------
      addStokEntry: (e) => { set((s) => ({ stokEntries: [{ ...e, id: id("stok") }, ...s.stokEntries] })); },
      updateStokEntry: (entryId, patch, aktor) => { set((s) => ({ stokEntries: s.stokEntries.map((e) => e.id === entryId ? { ...e, ...patch } : e) })); get().addAuditLog(aktor, "admin", "Mengubah data stok", entryId); },
      deleteStokEntry: (entryId, aktor) => { set((s) => ({ stokEntries: s.stokEntries.filter((e) => e.id !== entryId) })); get().addAuditLog(aktor, "admin", "Menghapus data stok", entryId); },
      updateKonsumsiEntry: (entryId, patch, aktor) => { set((s) => ({ konsumsiEntries: s.konsumsiEntries.map((e) => e.id === entryId ? { ...e, ...patch } : e) })); get().addAuditLog(aktor, "admin", "Mengubah data konsumsi", entryId); },
      deleteKonsumsiEntry: (entryId, aktor) => { set((s) => ({ konsumsiEntries: s.konsumsiEntries.filter((e) => e.id !== entryId) })); get().addAuditLog(aktor, "admin", "Menghapus data konsumsi", entryId); },
      saveNotificationFollowup: (entryId, aktor, catatan, hasil) => { set((s) => ({ notifikasi: s.notifikasi.map((n) => n.id === entryId ? { ...n, tindak_lanjut: "sudah_ditindaklanjuti", catatan_tindak_lanjut: catatan, ditangani_oleh: aktor, hasil_tindak_lanjut: hasil } : n) })); get().addAuditLog(aktor, "admin", "Mencatat tindak lanjut peringatan", entryId); }, 
      importHistoricalRows: (rows, aktor) => {
        const gagal: Array<{ baris: number; alasan: string }> = [];
        let tersimpan = 0;
        let diperbarui = 0;
        rows.forEach((r, index) => {
          const w = get().wilayah.find((x) => x.id === r.id_wilayah || x.nama_wilayah.toLowerCase() === r.id_wilayah.toLowerCase());
          const k = get().komoditas.find((x) => x.id === r.id_komoditas || x.nama_komoditas.toLowerCase() === r.id_komoditas.toLowerCase());
          if (!w) { gagal.push({ baris: index + 2, alasan: `Wilayah tidak ditemukan: ${r.id_wilayah}` }); return; }
          if (!k) { gagal.push({ baris: index + 2, alasan: `Komoditas tidak ditemukan: ${r.id_komoditas}` }); return; }
          if (!Number.isFinite(r.jumlah) || r.jumlah < 0) { gagal.push({ baris: index + 2, alasan: "Jumlah harus berupa angka >= 0" }); return; }
          if (!/^\d{4}-\d{2}(-\d{2})?$/.test(r.tanggal)) { gagal.push({ baris: index + 2, alasan: "Tanggal/periode harus YYYY-MM atau YYYY-MM-DD" }); return; }
          if (r.jenis === "stok") {
            const tanggal = r.tanggal.length === 7 ? `${r.tanggal}-01` : r.tanggal;
            const existing = get().stokEntries.find((x) => x.id_wilayah === w.id && x.id_komoditas === k.id && x.tanggal === tanggal && x.sumber === "bps_bapanas");
            if (existing) { set((st) => ({ stokEntries: st.stokEntries.map((x) => x.id === existing.id ? { ...x, jumlah: r.jumlah, dicatatOleh: aktor } : x) })); diperbarui++; }
            else { set((st) => ({ stokEntries: [{ id: id("stok"), id_wilayah: w.id, id_komoditas: k.id, jumlah: r.jumlah, tanggal, sumber: "bps_bapanas", dicatatOleh: aktor }, ...st.stokEntries] })); tersimpan++; }
          } else {
            const periode = r.tanggal.slice(0, 7);
            const existing = get().konsumsiEntries.find((x) => x.id_wilayah === w.id && x.id_komoditas === k.id && x.periode === periode && x.sumber === "bps_bapanas");
            if (existing) { set((st) => ({ konsumsiEntries: st.konsumsiEntries.map((x) => x.id === existing.id ? { ...x, jumlah: r.jumlah } : x) })); diperbarui++; }
            else { set((st) => ({ konsumsiEntries: [{ id: id("konsumsi"), id_wilayah: w.id, id_komoditas: k.id, jumlah: r.jumlah, periode, sumber: "bps_bapanas" as const }, ...st.konsumsiEntries] })); tersimpan++; }
          }
        });
        get().addAuditLog(aktor, "admin", "Impor data historis BPS/Bapanas", `tersimpan=${tersimpan}, diperbarui=${diperbarui}, gagal=${gagal.length}`);
        return { tersimpan, diperbarui, gagal };
      },
      addKonsumsiEntry: (e) => {
        set((s) => ({ konsumsiEntries: [{ ...e, id: id("konsumsi") }, ...s.konsumsiEntries] }));
      },
      addDistribusiEntry: (e) => {
        set((s) => ({ distribusiEntries: [{ ...e, id: id("distribusi") }, ...s.distribusiEntries] }));
      },
      updateDistribusiStatus: (did, status) => {
        set((s) => ({
          distribusiEntries: s.distribusiEntries.map((d) => (d.id === did ? { ...d, status } : d)),
        }));
      },

      // ---------------- Forecasting & Early Warning ----------------
      runForecastAll: (aktor) => {
        const s = get();
        const cfg = s.modelConfig;
        const forecastResults: HasilForecast[] = [];
        const seriesCache: Record<string, ReturnType<typeof runForecastSimulation>["series"]> = {};

        // Ambil stok & kebutuhan terbaru per kombinasi wilayah x komoditas.
        // Diindeks sekali jalan (O(n)) agar tetap cepat untuk data impor berukuran besar.
        const stokTerbaruMap = new Map<string, StokEntry>();
        for (const e of s.stokEntries) {
          const key = `${e.id_wilayah}:${e.id_komoditas}`;
          const cur = stokTerbaruMap.get(key);
          if (!cur || e.tanggal > cur.tanggal) stokTerbaruMap.set(key, e);
        }
        const konsumsiTerbaruMap = new Map<string, KonsumsiEntry>();
        for (const e of s.konsumsiEntries) {
          const key = `${e.id_wilayah}:${e.id_komoditas}`;
          const cur = konsumsiTerbaruMap.get(key);
          if (!cur || e.periode > cur.periode) konsumsiTerbaruMap.set(key, e);
        }
        for (const w of s.wilayah) {
          for (const k of s.komoditas) {
            const stokTerbaru = stokTerbaruMap.get(`${w.id}:${k.id}`);
            const konsumsiTerbaru = konsumsiTerbaruMap.get(`${w.id}:${k.id}`);
            if (!stokTerbaru || !konsumsiTerbaru) continue;

            const kebutuhanHarian = konsumsiTerbaru.jumlah / 30;
            const result = runForecastSimulation({
              idWilayah: w.id,
              idKomoditas: k.id,
              stokAwal: stokTerbaru.jumlah,
              kebutuhanHarian,
              horizonHari: cfg.horizon_hari,
              thresholdShortagePersen: cfg.threshold_shortage_persen,
              thresholdSurplusPersen: cfg.threshold_surplus_persen,
            });

            const key = `${w.id}:${k.id}`;
            seriesCache[key] = result.series;
            const lastPoint = result.series[result.series.length - 1];

            forecastResults.push({
              id: id("forecast"),
              id_wilayah: w.id,
              id_komoditas: k.id,
              nilai_proyeksi_ketersediaan: lastPoint ? lastPoint.proyeksi_ketersediaan : stokTerbaru.jumlah,
              nilai_proyeksi_kebutuhan: lastPoint ? lastPoint.proyeksi_kebutuhan : Math.round(kebutuhanHarian * 7),
              status: result.statusAkhir,
              periode: nowIso().slice(0, 10),
              hari_menuju_kejadian: result.hariMenujuKejadian,
              mape: result.mape,
              createdAt: nowIso(),
            });
          }
        }

        // FR-06: rekomendasi realokasi otomatis dari kombinasi shortage <-> surplus per komoditas.
        const rekomendasiBaru: Rekomendasi[] = [];
        for (const k of s.komoditas) {
          const shortageList = forecastResults.filter((f) => f.id_komoditas === k.id && f.status === "shortage" && f.hari_menuju_kejadian <= cfg.horizon_hari);
          const surplusList = forecastResults.filter((f) => f.id_komoditas === k.id && f.status === "surplus" && f.hari_menuju_kejadian <= cfg.horizon_hari);
          for (const def of shortageList) {
            const asal = surplusList.sort((a, b) => jarakAntarWilayahKm(def.id_wilayah, a.id_wilayah) - jarakAntarWilayahKm(def.id_wilayah, b.id_wilayah))[0];
            if (!asal) continue;
            const wilayahAsal = s.wilayah.find((w) => w.id === asal.id_wilayah);
            const wilayahTujuan = s.wilayah.find((w) => w.id === def.id_wilayah);
            if (!wilayahAsal || !wilayahTujuan) continue;
            rekomendasiBaru.push({
              id: id("rekom"),
              id_forecast: def.id,
              id_komoditas: k.id,
              wilayah_asal: wilayahAsal.nama_wilayah,
              wilayah_tujuan: wilayahTujuan.nama_wilayah,
              jumlah_saran: Math.round(Math.abs(def.nilai_proyeksi_kebutuhan - def.nilai_proyeksi_ketersediaan) * 1.1),
              jarak_km: jarakAntarWilayahKm(asal.id_wilayah, def.id_wilayah),
              status: "menunggu",
              createdAt: nowIso(),
            });
          }
        }

        // FR-05: notifikasi early warning, hanya untuk kejadian dalam <=30 hari,
        // dan hanya jika belum ada notifikasi identik yang masih menunggu tindak lanjut.
        const existingOpenKeys = new Set(
          s.notifikasi
            .filter((n) => n.tindak_lanjut === "menunggu_tindak_lanjut")
            .map((n) => `${n.id_wilayah}:${n.id_komoditas}:${n.status}`),
        );
        const notifikasiBaru: Notifikasi[] = [];
        for (const f of forecastResults) {
          if (f.status === "aman") continue;
          if (f.hari_menuju_kejadian > 30) continue;
          const key = `${f.id_wilayah}:${f.id_komoditas}:${f.status}`;
          if (existingOpenKeys.has(key)) continue;
          const w = s.wilayah.find((x) => x.id === f.id_wilayah);
          const k = s.komoditas.find((x) => x.id === f.id_komoditas);
          if (!w || !k) continue;
          const pesan =
            f.status === "shortage"
              ? `Potensi kekurangan (shortage) ${k.nama_komoditas} di ${w.nama_wilayah}, diperkirakan terjadi dalam ${f.hari_menuju_kejadian} hari.`
              : `Potensi kelebihan (surplus) ${k.nama_komoditas} di ${w.nama_wilayah}, diperkirakan terjadi dalam ${f.hari_menuju_kejadian} hari.`;
          const rekom = rekomendasiBaru.find((r) => r.id_forecast === f.id);
          notifikasiBaru.push({
            id: id("notif"),
            id_forecast: f.id,
            id_wilayah: f.id_wilayah,
            id_komoditas: f.id_komoditas,
            penerima_role: ["dinas", "bulog", "distributor"],
            kanal: ["dashboard", "whatsapp", "email"],
            pesan,
            rekomendasi_tindakan: rekom
              ? `Alokasikan pasokan dari ${rekom.wilayah_asal} sebanyak ${rekom.jumlah_saran} ${k.satuan}.`
              : f.status === "shortage"
                ? "Segera koordinasikan pengadaan tambahan dari wilayah surplus terdekat."
                : "Pertimbangkan realokasi surplus ke wilayah dengan proyeksi defisit.",
            status: f.status,
            status_kirim: "terkirim",
            tindak_lanjut: "menunggu_tindak_lanjut",
            waktu: nowIso(),
          });
        }

        set((st) => ({
          forecastResults,
          forecastSeriesCache: seriesCache,
          rekomendasi: [...rekomendasiBaru, ...st.rekomendasi],
          notifikasi: [...notifikasiBaru, ...st.notifikasi],
          lastForecastRun: nowIso(),
          modelConfig: { ...st.modelConfig, last_trained: nowIso() },
        }));

        get().addAuditLog(aktor.nama, aktor.role, "Menjalankan ulang model forecasting", `${forecastResults.length} kombinasi wilayah x komoditas`);
      },

      // Seri harian tidak disimpan di localStorage (ukurannya besar); dihitung
      // ulang secara deterministik dari stok & konsumsi terbaru bila belum ada di memori.
      getForecastSeries: (idWilayah, idKomoditas) => {
        const key = `${idWilayah}:${idKomoditas}`;
        const cached = get().forecastSeriesCache[key];
        if (cached) return cached;
        const s = get();
        let stok: StokEntry | undefined;
        for (const e of s.stokEntries) {
          if (e.id_wilayah === idWilayah && e.id_komoditas === idKomoditas && (!stok || e.tanggal > stok.tanggal)) stok = e;
        }
        let kons: KonsumsiEntry | undefined;
        for (const e of s.konsumsiEntries) {
          if (e.id_wilayah === idWilayah && e.id_komoditas === idKomoditas && (!kons || e.periode > kons.periode)) kons = e;
        }
        if (!stok || !kons) return [];
        const { series } = runForecastSimulation({
          idWilayah,
          idKomoditas,
          stokAwal: stok.jumlah,
          kebutuhanHarian: kons.jumlah / 30,
          horizonHari: s.modelConfig.horizon_hari,
          thresholdShortagePersen: s.modelConfig.threshold_shortage_persen,
          thresholdSurplusPersen: s.modelConfig.threshold_surplus_persen,
        });
        set((st) => ({ forecastSeriesCache: { ...st.forecastSeriesCache, [key]: series } }));
        return series;
      },

      updateRekomendasiStatus: (rid, status) => {
        set((s) => ({ rekomendasi: s.rekomendasi.map((r) => (r.id === rid ? { ...r, status } : r)) }));
      },

      tindakLanjutNotifikasi: (nid) => {
        set((s) => ({
          notifikasi: s.notifikasi.map((n) => (n.id === nid ? { ...n, tindak_lanjut: "sudah_ditindaklanjuti" } : n)),
        }));
      },

      retryEmailNotification: (nid, aktor) => {
        set((s) => ({ notifikasi: s.notifikasi.map((n) => n.id === nid ? { ...n, status_kirim: "terkirim", kanal: n.kanal.includes("email") ? n.kanal : [...n.kanal, "email"] } : n) }));
        get().addAuditLog(aktor, "admin", "Simulasi kirim ulang email notifikasi", nid);
      },

      addAuditLog: (aktor, aktorRole, aksi, target) => {
        set((s) => ({
          auditLog: [{ id: id("audit"), aktor, aktorRole, aksi, target, waktu: nowIso() }, ...s.auditLog].slice(0, 300),
        }));
      },

      updateModelConfig: (patch) => {
        set((s) => ({ modelConfig: { ...s.modelConfig, ...patch } }));
      },
    }),
    {
      name: "ketahananpangan-store-v2",
      version: STORE_VERSION,
      // Seri forecast (950 kombinasi x 30 hari) terlalu besar untuk localStorage; dihitung ulang saat dibutuhkan.
      partialize: (state) => {
        const { forecastSeriesCache: _omit, ...rest } = state;
        void _omit;
        return rest as unknown as DataState;
      },
      // v0 -> v1: perluas master data ke 38 provinsi x 25 komoditas tanpa menimpa
      // suntingan pengguna (hanya menambah id yang belum ada) dan beri data simulasi
      // untuk kombinasi baru saja, sehingga data yang sudah diinput/diimpor tetap utuh.
      migrate: (persisted, version) => {
        const st = persisted as Partial<DataState>;
        if (version < 1 && st && Array.isArray(st.wilayah) && Array.isArray(st.komoditas)) {
          const wIds = new Set(st.wilayah.map((w) => w.id));
          const kIds = new Set(st.komoditas.map((k) => k.id));
          const wBaru = SEED_WILAYAH.filter((w) => !wIds.has(w.id));
          const kBaru = SEED_KOMODITAS.filter((k) => !kIds.has(k.id));
          if (wBaru.length > 0 || kBaru.length > 0) {
            const wilayahSemua = [...st.wilayah, ...wBaru];
            const komoditasSemua = [...st.komoditas, ...kBaru];
            // Kombinasi baru = melibatkan wilayah baru ATAU komoditas baru.
            const combos: { w: Wilayah; k: Komoditas }[] = [];
            for (const w of wilayahSemua) for (const k of komoditasSemua) if (!wIds.has(w.id) || !kIds.has(k.id)) combos.push({ w, k });
            const extra = { stokEntries: [] as StokEntry[], konsumsiEntries: [] as KonsumsiEntry[] };
            for (const { w, k } of combos) {
              const one = buatSeedEntries([w], [k]);
              extra.stokEntries.push(...one.stokEntries);
              extra.konsumsiEntries.push(...one.konsumsiEntries);
            }
            st.wilayah = wilayahSemua;
            st.komoditas = komoditasSemua;
            st.stokEntries = [...(st.stokEntries ?? []), ...extra.stokEntries];
            st.konsumsiEntries = [...(st.konsumsiEntries ?? []), ...extra.konsumsiEntries];
            masterDataDiperluas = true;
          }
        }
        return st as DataState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        if (masterDataDiperluas) {
          masterDataDiperluas = false;
          // Tunda satu tick: useDataStore belum terdefinisi saat hidrasi sinkron berlangsung.
          setTimeout(() => useDataStore.getState().runForecastAll({ nama: "System", role: "admin" }), 0);
        }
      },
    },
  ),
);
