import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  ArrowRight, BarChart3, Bell, Building2, CheckCircle2, Cpu, MapPinned, Play,
  RefreshCcw, ShieldCheck, Sparkles, Sprout, Truck, UserCog, Landmark, Warehouse,
} from "lucide-react";

const FEATURES = [
  { icon: MapPinned, color: "text-emerald-300 bg-emerald-500/15", title: "Dashboard Monitoring", desc: "Peta status stok per wilayah, tren stok vs kebutuhan, dan rekomendasi realokasi otomatis." },
  { icon: Sprout, color: "text-lime-300 bg-lime-500/15", title: "Forecasting Berbasis AI", desc: "Model time-series memproyeksikan stok & kebutuhan hingga 30 hari ke depan." },
  { icon: Bell, color: "text-amber-300 bg-amber-500/15", title: "Peringatan Dini Otomatis", desc: "Notifikasi instan saat stok mendekati kondisi rawan lewat dashboard, WhatsApp, dan email." },
  { icon: RefreshCcw, color: "text-sky-300 bg-sky-500/15", title: "Rekomendasi Realokasi", desc: "Saran perpindahan komoditas dari wilayah surplus ke wilayah defisit berdasar proyeksi & jarak." },
  { icon: BarChart3, color: "text-teal-300 bg-teal-500/15", title: "Laporan & Ekspor Data", desc: "Rekap proyeksi dan status stok siap diunduh (PDF/Excel) untuk rapat koordinasi." },
  { icon: ShieldCheck, color: "text-violet-300 bg-violet-500/15", title: "Akses Berbasis Peran", desc: "Empat peran pengguna dengan halaman kerja masing-masing dan audit log aktivitas." },
];

const TINTS = ["tint-emerald", "tint-emerald", "tint-amber", "tint-sky", "tint-emerald", "tint-violet"];

const ROLES = [
  { icon: Landmark, title: "Dinas Ketahanan Pangan / Bappenas", desc: "Monitoring wilayah, proyeksi forecasting, evaluasi wilayah, dan laporan kebijakan." },
  { icon: Warehouse, title: "Bulog / Badan Pangan Nasional", desc: "Cadangan gudang, notifikasi shortage, dan eksekusi realokasi logistik." },
  { icon: Truck, title: "Distributor / Pelaku Usaha", desc: "Pasokan & rantai pasok, input distribusi, tren permintaan pasar." },
  { icon: UserCog, title: "Administrator", desc: "Kelola pengguna, data master wilayah/komoditas, dan parameter model AI." },
];

const STEPS = [
  { n: "01", title: "Kumpulkan Data", desc: "Stok gudang, konsumsi, dan distribusi diinput atau diimpor dari CSV/Excel." },
  { n: "02", title: "Proyeksi AI", desc: "Model time-series menghitung ketersediaan vs kebutuhan hingga 30 hari." },
  { n: "03", title: "Peringatan Dini", desc: "Status aman, defisit, atau surplus dikirim ke pihak terkait secara otomatis." },
  { n: "04", title: "Tindak Lanjut", desc: "Rekomendasi realokasi antar-wilayah dieksekusi dan dilacak statusnya." },
];

const REGIONS = [
  { name: "Jawa Timur", ratio: "1.25x", tone: "emerald", pct: 78 },
  { name: "DKI Jakarta", ratio: "0.65x", tone: "rose", pct: 32 },
  { name: "Jawa Tengah", ratio: "1.80x", tone: "amber", pct: 92 },
  { name: "Bali", ratio: "1.20x", tone: "sky", pct: 70 },
] as const;

const TONE = {
  emerald: { text: "text-emerald-300", bar: "bg-emerald-400" },
  rose: { text: "text-rose-300", bar: "bg-rose-400" },
  amber: { text: "text-amber-300", bar: "bg-amber-400" },
  sky: { text: "text-sky-300", bar: "bg-sky-400" },
};

export default function LandingPage() {
  return (
    <div className="app-shell-bg dash-shell min-h-screen overflow-x-hidden text-slate-100">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/30 bg-[#051410]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Logo />
          <nav className="hidden items-center gap-9 text-sm font-medium text-slate-300 md:flex">
            <a href="#beranda" className="text-emerald-400">Beranda</a>
            <a href="#fitur" className="transition hover:text-white">Fitur</a>
            <a href="#teknologi" className="transition hover:text-white">Teknologi</a>
            <a href="#peran" className="transition hover:text-white">Peran Pengguna</a>
            <a href="#cara-kerja" className="transition hover:text-white">Cara Kerja</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:text-white sm:block">Masuk</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 rounded-full bg-lime-300 px-5 py-2 text-sm font-bold text-emerald-950 shadow-lg shadow-lime-500/20 transition hover:bg-lime-200">
              Daftar Akun <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="beranda" className="relative">
        <div className="grid-pattern pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" /> Sistem Ketahanan Pangan Nasional
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Memantau Stok.<br />
              <span className="glow-text">Menjaga Ketahanan Pangan.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300">
              FoodStock AI membantu Dinas Ketahanan Pangan, Bulog, dan distributor memantau ketersediaan,
              memprediksi kebutuhan dengan model time-series, dan memberi peringatan dini defisit maupun
              surplus sebelum terjadi di lapangan.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-7 py-3.5 text-sm font-bold text-emerald-950 shadow-lg shadow-lime-500/20 transition hover:-translate-y-0.5 hover:bg-lime-200">
                Mulai Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300"><Play className="h-3 w-3 fill-current" /></span>
                Saya Sudah Punya Akun
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-3 rounded-2xl border border-emerald-900/40 bg-[#081c16]/70 p-4 backdrop-blur">
              {[
                ["38", "Provinsi Dipantau"],
                ["25", "Komoditas Pokok"],
                ["≤30 hari", "Horizon Peringatan"],
              ].map(([v, l]) => (
                <div key={l} className="px-2">
                  <dt className="text-xl font-extrabold text-white sm:text-2xl">{v}</dt>
                  <dd className="mt-0.5 text-[11px] leading-tight text-slate-400">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Live insights card */}
          <div className="fade-up relative [animation-delay:150ms]">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-transparent to-lime-400/10 blur-2xl" />
            <div className="agri-card relative p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" /> Live Stock Insights
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">Aktif</span>
              </div>
              <div className="space-y-4">
                {REGIONS.map((r) => (
                  <div key={r.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-slate-300">{r.name}</span>
                      <span className={`font-bold ${TONE[r.tone].text}`}>{r.ratio}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className={`h-full rounded-full ${TONE[r.tone].bar}`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
                <strong className="mb-1 flex items-center gap-1.5 font-bold text-rose-300"><Bell className="h-3.5 w-3.5" /> Peringatan Dini</strong>
                Stok Cabai Rawit Merah di DKI Jakarta diperkirakan bertahan kurang dari 7 hari.
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="accent-card p-4">
                  <p className="text-[11px] font-semibold opacity-70">Akurasi Forecast</p>
                  <p className="mt-1 text-2xl font-extrabold">94.2%</p>
                </div>
                <div className="rounded-2xl border border-emerald-900/50 bg-[#051410]/70 p-4">
                  <p className="text-[11px] font-semibold text-slate-400">Wilayah Aman</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-300">31 / 38</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="relative py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Fitur Utama</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Satu Platform untuk<br />Siklus Ketahanan Pangan</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-400 md:justify-self-end">
              Dari monitoring harian hingga rekomendasi realokasi otomatis, semua fungsi inti tersedia dalam satu dashboard.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className={`agri-card group p-6 hover:-translate-y-1 ${TINTS[FEATURES.indexOf(f)]}`}>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEKNOLOGI */}
      <section id="teknologi" className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Teknologi Kami</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Data. AI.<br />Lebih Baik Bersama.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Kami menggabungkan data stok lapangan dan model forecasting menjadi wawasan yang bisa langsung ditindaklanjuti.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              {["Monitoring stok per wilayah & komoditas", "Rekomendasi berbasis proyeksi AI", "Notifikasi multi-kanal otomatis", "Mudah digunakan di web & perangkat mobile"].map((t) => (
                <li key={t} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-lime-300" />{t}</li>
              ))}
            </ul>
            <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-emerald-950 transition hover:bg-lime-200">
              Coba Sekarang <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mock dashboard */}
          <div className="agri-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-900/30 px-5 py-3.5">
              <span className="flex items-center gap-2 text-sm font-semibold text-white"><Cpu className="h-4 w-4 text-emerald-400" /> Ringkasan Stok Nasional</span>
              <span className="text-[11px] text-slate-500">30 hari terakhir</span>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-900/40 bg-[#051410]/70 p-4">
                <p className="text-[11px] text-slate-400">Total Wilayah</p>
                <p className="mt-1 text-3xl font-extrabold text-white">12</p>
              </div>
              <div className="rounded-2xl border border-emerald-900/40 bg-[#051410]/70 p-4">
                <p className="text-[11px] text-slate-400">Prediksi Ketersediaan</p>
                <p className="mt-1 text-3xl font-extrabold text-emerald-300">+18%</p>
              </div>
              <div className="accent-card p-4">
                <p className="text-[11px] font-semibold opacity-70">Status Aman</p>
                <p className="mt-1 text-3xl font-extrabold">85%</p>
              </div>
            </div>
            <div className="px-5 pb-5">
              <div className="rounded-2xl border border-emerald-900/40 bg-[#051410]/70 p-4">
                <p className="mb-3 text-xs font-semibold text-slate-300">Tren Stok vs Kebutuhan</p>
                <svg viewBox="0 0 600 140" className="w-full" aria-hidden="true">
                  {[20, 55, 90, 125].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(148,163,184,.12)" strokeDasharray="4 4" />)}
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity=".35" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,100 C60,90 100,60 160,70 C220,80 260,40 320,45 C380,50 420,25 480,30 C530,34 570,20 600,18 L600,140 L0,140 Z" fill="url(#g1)" />
                  <path d="M0,100 C60,90 100,60 160,70 C220,80 260,40 320,45 C380,50 420,25 480,30 C530,34 570,20 600,18" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0,85 C80,88 140,80 200,84 C280,90 340,78 400,80 C470,82 540,76 600,74" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 6" />
                </svg>
                <div className="mt-2 flex gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Stok</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Kebutuhan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERAN */}
      <section id="peran" className="py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Peran Pengguna</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Halaman Kerja Sesuai Peran</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <div key={r.title} className="agri-card p-6 hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  <r.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold text-white">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section id="cara-kerja" className="py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Cara Kerja</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Dari Data Menjadi Tindakan</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-emerald-900/40 bg-[#081c16]/60 p-6">
                <span className="glow-text text-4xl font-extrabold">{s.n}</span>
                <h3 className="mt-3 font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 md:px-10">
        <div className="keep-dark relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-[#0b2920] via-[#081c16] to-[#04100c] p-10 md:p-14">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1400&auto=format&fit=crop')" }}
          />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-lime-400/15 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">Siap memantau ketahanan pangan wilayah Anda?</h2>
              <p className="mt-3 text-sm text-slate-300">Buat akun instansi Anda dan mulai pantau status pangan nasional hari ini.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-7 py-3.5 text-sm font-bold text-emerald-950 transition hover:bg-lime-200">
                Daftar Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                <Building2 className="h-4 w-4" /> Masuk ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-emerald-900/30 px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
          <Logo />
          <p>© 2026 D3 Teknik Informatika Kab. Madiun, Sekolah Vokasi UNS</p>
        </div>
      </footer>
    </div>
  );
}
