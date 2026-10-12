"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Card, Input, Button } from "@/components/ui/Basics";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  return (
    <div className="app-shell-bg dash-shell relative flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-slate-100">
      <div className="absolute right-4 top-4 z-30"><ThemeToggle /></div>
      <Link href="/">
        <Logo />
      </Link>
      <Card className="agri-card w-full max-w-md border border-emerald-900/40 bg-[#081c16]/80 backdrop-blur-xl p-8" padding="lg">
        <h1 className="text-xl font-bold text-white">Reset Password</h1>
        <p className="mt-2 text-xs text-slate-300">Form ini menyiapkan UI reset; token email dan validasi backend perlu diaktifkan sebelum penggunaan produksi.</p>
        
        <form className="mt-5 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          setMsg(
            password.length < 8
              ? "Password minimal 8 karakter."
              : password !== confirm
              ? "Konfirmasi password tidak sama."
              : "Form valid, tetapi reset belum dilakukan karena layanan token backend belum tersedia."
          );
        }}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Password baru
            <Input 
              type="password" 
              required 
              minLength={8} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="mt-1 bg-[#051410] border-emerald-900/50 text-white"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Konfirmasi password
            <Input 
              type="password" 
              required 
              value={confirm} 
              onChange={(e) => setConfirm(e.target.value)} 
              className="mt-1 bg-[#051410] border-emerald-900/50 text-white"
            />
          </label>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-2.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2" type="submit">
            <KeyRound className="h-4 w-4" /> Reset password
          </Button>
        </form>

        {msg && (
          <p className="mt-4 rounded-xl border border-emerald-900/50 bg-[#051410] p-3 text-xs text-slate-300">
            {msg}
          </p>
        )}

        <Link className="mt-4 block text-center text-xs font-medium text-emerald-400 hover:text-emerald-300 transition" href="/login">
          Kembali ke login
        </Link>
      </Card>
    </div>
  );
}