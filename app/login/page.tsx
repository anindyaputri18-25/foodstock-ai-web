"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Cpu, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Button, Input } from "@/components/ui/Basics";
import { useLoginMutation } from "@/hooks/useAuth";
import { LoginSchema } from "@/types/domain";

const DEMO_ACCOUNTS = [
  { label: "Administrator", email: "admin@ketahananpangan.id", password: "admin123" },
  { label: "Dinas / Bappenas", email: "dinas@ketahananpangan.id", password: "dinas123" },
  { label: "Bulog", email: "bulog@ketahananpangan.id", password: "bulog123" },
  { label: "Distributor", email: "distributor@ketahananpangan.id", password: "distributor123" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();

  // Login asli: kredensial diverifikasi terhadap data pengguna, lalu server
  // menerbitkan cookie sesi httpOnly yang diperiksa middleware.ts. Tanpa
  // cookie itu, semua rute dashboard akan diarahkan kembali ke /login.
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    const parsed = LoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Data login tidak valid.");
      return;
    }
    loginMutation.mutate(parsed.data);
  };

  return (
    <div className="app-shell-bg dash-shell relative flex min-h-screen w-full lg:grid lg:grid-cols-2 text-slate-100">
      <div className="absolute right-4 top-4 z-30"><ThemeToggle /></div>
      <div className="hero-panel relative hidden lg:flex flex-col justify-between p-12 border-r border-emerald-900/30 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-25 mix-blend-overlay bg-cover bg-center pointer-events-none" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1200&auto=format&fit=crop')" }} 
        />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/20 p-2.5 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <Cpu className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-xl font-extrabold tracking-wider text-white">FOODSTOCK<span className="text-emerald-400">.AI</span></span>
        </div>

        <div className="relative z-10 my-auto max-w-lg py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 mb-6 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> SMART NATIONAL FOOD SECURITY
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight xl:text-5xl">
            Modern Solutions for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">National Food Resilience.</span>
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Platform pemantauan stok pangan nasional berbasis kecerdasan buatan, proyeksi *time-series*, mitigasi dini *shortage*, dan koordinasi realokasi logistik antar-wilayah.
          </p>
          
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-emerald-900/50 pt-6">
            <div className="agri-card p-4 text-center rounded-xl bg-[#081c16]/80 border border-emerald-900/40">
              <p className="text-2xl font-extrabold text-emerald-400">99.8%</p>
              <p className="text-[11px] text-slate-400 mt-1">Akurasi Forecast</p>
            </div>
            <div className="agri-card p-4 text-center rounded-xl bg-[#081c16]/80 border border-emerald-900/40">
              <p className="text-2xl font-extrabold text-emerald-400">38</p>
              <p className="text-[11px] text-slate-400 mt-1">Provinsi Terpantau</p>
            </div>
            <div className="agri-card p-4 text-center rounded-xl bg-[#081c16]/80 border border-emerald-900/40">
              <p className="text-2xl font-extrabold text-emerald-400">Real-time</p>
              <p className="text-[11px] text-slate-400 mt-1">Early Warning</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>© 2026 FoodStock AI System</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold"><ShieldCheck className="h-4 w-4" /> Secure Auth & HMAC Log</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative bg-[#051410]">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="rounded-2xl bg-emerald-500/20 p-2.5 border border-emerald-500/30">
              <Cpu className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-xl font-extrabold tracking-wider text-white">FOODSTOCK<span className="text-emerald-400">.AI</span></span>
          </div>
          
          <div className="agri-card border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Masuk Portal Sistem</h2>
              <p className="text-xs text-slate-400 mt-1.5">Masukkan kredensial akun instansi Anda untuk mengakses layanan.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Instansi</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <Input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="nama@instansi.go.id"
                    className="pl-10 bg-[#051410]/80 border-emerald-900/50 text-white placeholder:text-slate-600 focus:border-emerald-500 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition">Lupa password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <Input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="pl-10 bg-[#051410]/80 border-emerald-900/50 text-white placeholder:text-slate-600 focus:border-emerald-500 rounded-xl"
                  />
                </div>
              </div>

              {(fieldError || loginMutation.isError) && (
                <p className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs text-rose-300" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {fieldError ?? (loginMutation.error as Error).message}
                </p>
              )}

              <Button type="submit" loading={loginMutation.isPending} className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition duration-200">
                Masuk Sistem <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 rounded-xl border border-emerald-900/40 bg-[#051410]/60 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Akun demo (klik untuk mengisi)</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => {
                      setEmail(a.email);
                      setPassword(a.password);
                    }}
                    className="rounded-lg border border-emerald-900/50 px-2.5 py-2 text-left text-[11px] text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400">
              Belum terdaftar? <Link href="/register" className="text-emerald-400 font-bold hover:underline">Registrasi Akun Baru</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}