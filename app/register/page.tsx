"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, ShieldCheck, ArrowRight, Lock, Mail, User, Building, UserCheck } from "lucide-react";
import { Button, Input, Select } from "@/components/ui/Basics";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nama: "", email: "", instansi: "", role: "dinas", password: "" });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  return (
    <div className="app-shell-bg dash-shell relative flex min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-30"><ThemeToggle /></div>
      {/* Sisi Kiri: Panel Informasi FoodStock AI */}
      <div className="hero-panel relative hidden lg:flex flex-col justify-between p-12 border-r border-emerald-900/30 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center pointer-events-none" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1200&auto=format&fit=crop')" }} 
        />
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/20 p-2.5 border border-emerald-500/30">
            <Cpu className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-xl font-extrabold tracking-wider text-white">FOODSTOCK<span className="text-emerald-400">.AI</span></span>
        </div>

        <div className="relative z-10 my-auto max-w-lg py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 mb-6">
            <UserCheck className="h-3.5 w-3.5" /> Pendaftaran Pengguna Terverifikasi
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight xl:text-5xl">
            Bergabung dalam Ekosistem <span className="text-emerald-400">Ketahanan Pangan.</span>
          </h1>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            Daftarkan instansi Anda (Dinas Pangan, Bulog, Distributor, atau Administrator) untuk mendapatkan akses analisis stok, prediksi AI, dan alur alokasi bahan pangan strategis.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>© 2026 FoodStock AI System</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold"><ShieldCheck className="h-4 w-4" /> Akun Wajib Verifikasi Admin</span>
        </div>
      </div>

      {/* Sisi Kanan: Form Register */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="agri-card p-8 sm:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Pendaftaran Akun Baru</h2>
              <p className="text-xs text-slate-400 mt-1">Lengkapi data Anda untuk mengajukan akses ke FoodStock AI.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <Input 
                    required 
                    value={form.nama} 
                    onChange={(e) => setForm({ ...form, nama: e.target.value })} 
                    placeholder="Budi Santoso, S.T." 
                    className="pl-10 bg-[#051410]/80 border-emerald-900/50 text-white placeholder:text-slate-600 focus:border-emerald-500 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Instansi</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <Input 
                    type="email" 
                    required 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    placeholder="budi@dinas.go.id" 
                    className="pl-10 bg-[#051410]/80 border-emerald-900/50 text-white placeholder:text-slate-600 focus:border-emerald-500 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nama Instansi / Wilayah</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <Input 
                    required 
                    value={form.instansi} 
                    onChange={(e) => setForm({ ...form, instansi: e.target.value })} 
                    placeholder="Dinas Ketahanan Pangan Prov. Jateng" 
                    className="pl-10 bg-[#051410]/80 border-emerald-900/50 text-white placeholder:text-slate-600 focus:border-emerald-500 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Peran (Role)</label>
                <Select 
                  value={form.role} 
                  onChange={(e) => setForm({ ...form, role: e.target.value })} 
                  className="bg-[#051410]/80 border-emerald-900/50 text-white rounded-xl"
                >
                  <option value="dinas" className="bg-[#061a14] text-white">Dinas / Bappenas</option>
                  <option value="bulog" className="bg-[#061a14] text-white">Bulog</option>
                  <option value="distributor" className="bg-[#061a14] text-white">Distributor Logistik</option>
                  <option value="admin" className="bg-[#061a14] text-white">Administrator</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <Input 
                    type="password" 
                    required 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    placeholder="••••••••" 
                    className="pl-10 bg-[#051410]/80 border-emerald-900/50 text-white placeholder:text-slate-600 focus:border-emerald-500 rounded-xl"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2">
                Daftarkan Akun <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Sudah punya akun? <Link href="/login" className="text-emerald-400 font-bold hover:underline">Masuk Ke Sistem</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}