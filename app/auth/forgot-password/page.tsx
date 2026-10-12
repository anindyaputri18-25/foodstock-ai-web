"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Card, Input, Button } from "@/components/ui/Basics";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="app-shell-bg dash-shell relative flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-slate-100">
      <div className="absolute right-4 top-4 z-30"><ThemeToggle /></div>
      <Link href="/">
        <Logo />
      </Link>
      <Card className="agri-card w-full max-w-md border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-8" padding="lg">
        <h1 className="text-xl font-bold text-white">Lupa Password</h1>
        <p className="mt-2 text-xs text-slate-300">Masukkan email akun untuk memulai proses reset password.</p>
        
        <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Email
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="nama@email.com" 
              className="mt-1 bg-[#051410] border-emerald-900/50 text-white placeholder:text-slate-600"
            />
          </label>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-2.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" /> Kirim instruksi reset
          </Button>
        </form>

        {sent && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-300">
            Permintaan dicatat dalam tampilan demo. Pengiriman email belum aktif; reset token harus dibuat dan diverifikasi melalui backend sebelum digunakan di produksi.
          </div>
        )}

        <Link className="mt-4 block text-center text-xs font-medium text-emerald-400 hover:text-emerald-300 transition" href="/login">
          Kembali ke login
        </Link>
      </Card>
    </div>
  );
}