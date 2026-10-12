import { z } from "zod";

/* ========================================================================
 * FoodStock AI, Domain Schemas (Zod)
 * Mengikuti Kamus Data pada SKPL BAB VI dan aktor pada SKPL BAB II/VII.
 * ==================================================================== */

// ---- Role & User (FR-01) --------------------------------------------
export const RoleSchema = z.enum(["admin", "dinas", "bulog", "distributor"]);
export type Role = z.infer<typeof RoleSchema>;

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  dinas: "Petugas Dinas Ketahanan Pangan / Bappenas",
  bulog: "Petugas Bulog / Badan Pangan Nasional",
  distributor: "Distributor / Pelaku Usaha Pangan",
};

export const UserStatusSchema = z.enum(["aktif", "pending", "ditolak", "terkunci"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const UserSchema = z.object({
  id: z.string(),
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter."),
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  role: RoleSchema,
  instansi: z.string().min(2, "Nama instansi/wilayah wajib diisi."),
  status: UserStatusSchema,
  percobaanGagal: z.number().default(0),
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
});
export type LoginFormData = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    nama: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
    email: z.string().email({ message: "Format email tidak valid." }),
    instansi: z.string().min(2, { message: "Nama instansi/wilayah wajib diisi." }),
    role: RoleSchema,
    password: z.string().min(6, { message: "Password minimal 6 karakter." }),
    konfirmasiPassword: z.string(),
  })
  .refine((data) => data.password === data.konfirmasiPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["konfirmasiPassword"],
  });
export type RegisterFormData = z.infer<typeof RegisterSchema>;

// ---- Wilayah & Komoditas (FR-08) -------------------------------------
export const WilayahSchema = z.object({
  id: z.string(),
  nama_wilayah: z.string().min(2),
  provinsi: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
});
export type Wilayah = z.infer<typeof WilayahSchema>;

export const KomoditasKategoriSchema = z.enum(["pokok", "hortikultura", "protein", "lainnya"]);

export const KomoditasSchema = z.object({
  id: z.string(),
  nama_komoditas: z.string().min(2),
  kategori: KomoditasKategoriSchema,
  satuan: z.enum(["ton", "kg", "kuintal"]),
  ambang_batas: z.number().nonnegative(),
});
export type Komoditas = z.infer<typeof KomoditasSchema>;

// ---- Data historis (FR-02) -------------------------------------------
export const StokEntrySchema = z.object({
  id: z.string(),
  id_wilayah: z.string(),
  id_komoditas: z.string(),
  jumlah: z.number().nonnegative(),
  tanggal: z.string(),
  sumber: z.enum(["manual", "gudang_bulog", "distribusi", "bps_bapanas", "simulasi"]),
  dicatatOleh: z.string(),
});
export type StokEntry = z.infer<typeof StokEntrySchema>;

export const KonsumsiEntrySchema = z.object({
  id: z.string(),
  id_wilayah: z.string(),
  id_komoditas: z.string(),
  jumlah: z.number().nonnegative(),
  periode: z.string(),
  sumber: z.enum(["manual", "bps_bapanas", "simulasi"]).optional(),
});
export type KonsumsiEntry = z.infer<typeof KonsumsiEntrySchema>;

export const DistribusiStatusSchema = z.enum(["rencana", "dikirim", "selesai"]);
export const DistribusiEntrySchema = z.object({
  id: z.string(),
  id_wilayah_asal: z.string(),
  id_wilayah_tujuan: z.string(),
  id_komoditas: z.string(),
  jumlah: z.number().nonnegative(),
  tanggal: z.string(),
  status: DistribusiStatusSchema,
  dicatatOleh: z.string(),
});
export type DistribusiEntry = z.infer<typeof DistribusiEntrySchema>;

// ---- Forecasting (FR-03) ----------------------------------------------
export const StatusProyeksiSchema = z.enum(["aman", "shortage", "surplus"]);
export type StatusProyeksi = z.infer<typeof StatusProyeksiSchema>;

export const HasilForecastSchema = z.object({
  id: z.string(),
  id_wilayah: z.string(),
  id_komoditas: z.string(),
  nilai_proyeksi_ketersediaan: z.number(),
  nilai_proyeksi_kebutuhan: z.number(),
  status: StatusProyeksiSchema,
  periode: z.string(),
  hari_menuju_kejadian: z.number(),
  mape: z.number(),
  createdAt: z.string(),
});
export type HasilForecast = z.infer<typeof HasilForecastSchema>;

export const ForecastSeriesPointSchema = z.object({
  tanggal: z.string(),
  proyeksi_ketersediaan: z.number(),
  proyeksi_kebutuhan: z.number(),
  status: StatusProyeksiSchema,
});
export type ForecastSeriesPoint = z.infer<typeof ForecastSeriesPointSchema>;

// ---- Rekomendasi Realokasi (FR-06) ------------------------------------
export const RekomendasiStatusSchema = z.enum(["menunggu", "disetujui", "eskalasi", "selesai"]);
export const RekomendasiSchema = z.object({
  id: z.string(),
  id_forecast: z.string(),
  id_komoditas: z.string(),
  wilayah_asal: z.string(),
  wilayah_tujuan: z.string(),
  jumlah_saran: z.number().nonnegative(),
  jarak_km: z.number().nonnegative(),
  status: RekomendasiStatusSchema,
  createdAt: z.string(),
});
export type Rekomendasi = z.infer<typeof RekomendasiSchema>;

// ---- Notifikasi Early Warning (FR-05 / FR-10) --------------------------
export const KanalNotifikasiSchema = z.enum(["dashboard", "whatsapp", "email"]);
export const StatusKirimSchema = z.enum(["terkirim", "gagal", "menunggu"]);
export const TindakLanjutSchema = z.enum(["menunggu_tindak_lanjut", "sudah_ditindaklanjuti"]);

export const NotifikasiSchema = z.object({
  id: z.string(),
  id_forecast: z.string(),
  id_wilayah: z.string(),
  id_komoditas: z.string(),
  penerima_role: z.array(RoleSchema),
  kanal: z.array(KanalNotifikasiSchema),
  pesan: z.string(),
  rekomendasi_tindakan: z.string(),
  status: StatusProyeksiSchema,
  status_kirim: StatusKirimSchema,
  tindak_lanjut: TindakLanjutSchema,
  waktu: z.string(),
  catatan_tindak_lanjut: z.string().optional(),
  ditangani_oleh: z.string().optional(),
  hasil_tindak_lanjut: z.string().optional(),
});
export type Notifikasi = z.infer<typeof NotifikasiSchema>;

// ---- Audit Log (NFR-10) -------------------------------------------------
export const AuditLogSchema = z.object({
  id: z.string(),
  aktor: z.string(),
  aktorRole: RoleSchema,
  aksi: z.string(),
  target: z.string(),
  waktu: z.string(),
});
export type AuditLogEntry = z.infer<typeof AuditLogSchema>;

// ---- Konfigurasi Model AI (Admin) --------------------------------------
export const ModelConfigSchema = z.object({
  threshold_shortage_persen: z.number().min(1).max(100),
  threshold_surplus_persen: z.number().min(1).max(100),
  horizon_hari: z.number().min(1).max(90),
  mape_current: z.number(),
  last_trained: z.string(),
  status_model: z.enum(["aktif", "melatih_ulang"]),
});
export type ModelConfig = z.infer<typeof ModelConfigSchema>;

// ---- Async state pattern (dipakai hooks TanStack Query) ----------------
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// ---- Session (cookie payload, ditandatangani di server) ---------------
export const SessionPayloadSchema = z.object({
  userId: z.string(),
  nama: z.string(),
  role: RoleSchema,
  instansi: z.string(),
  iat: z.number(),
});
export type SessionPayload = z.infer<typeof SessionPayloadSchema>;
