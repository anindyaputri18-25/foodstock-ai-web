"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { LoginSchema } from "@/types/domain";
import { useLoginMutation } from "@/hooks/useAuth";
import { Button, FormField, Input } from "@/components/ui/Basics";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Administrator", email: "admin@ketahananpangan.id", password: "admin123" },
  { label: "Dinas / Bappenas", email: "dinas@ketahananpangan.id", password: "dinas123" },
  { label: "Bulog", email: "bulog@ketahananpangan.id", password: "bulog123" },
  { label: "Distributor", email: "distributor@ketahananpangan.id", password: "distributor123" },
];

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirected = searchParams.get("redirected") === "1";
  const registered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const loginMutation = useLoginMutation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({ email: flat.email?.[0], password: flat.password?.[0] });
      return;
    }
    loginMutation.mutate(result.data);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg">
      <h1 className="text-center text-2xl font-bold text-slate-800">Masuk Akun</h1>
      <p className="text-center text-sm text-emerald-700">Sistem Monitoring Ketahanan Pangan</p>

      {redirected && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Silakan masuk terlebih dahulu untuk mengakses halaman tersebut.
        </p>
      )}
      {registered && (
        <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Registrasi berhasil, menunggu verifikasi Administrator.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField label="Email" htmlFor="login-email" error={errors.email}>
          <Input id="login-email" type="email" placeholder="nama@instansi.go.id" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="Kata Sandi" htmlFor="login-password" error={errors.password}>
          <Input id="login-password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>

        {loginMutation.isError && (
          <p className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4" /> {(loginMutation.error as Error).message}
          </p>
        )}

        <Button type="submit" className="w-full" loading={loginMutation.isPending}>
          Masuk ke Dashboard
        </Button>
      <div className="mt-3 text-right"><a href="/auth/forgot-password" className="text-sm font-medium text-emerald-700 hover:underline">Lupa password?</a></div></form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <a href="/register" className="font-semibold text-emerald-700 underline">
          Daftar di sini
        </a>
      </p>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <p className="mb-2 text-xs font-semibold text-slate-500">Akun demo (klik untuk isi otomatis)</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => {
                setEmail(acc.email);
                setPassword(acc.password);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-[11px] text-slate-600 hover:border-emerald-400 hover:text-emerald-700"
            >
              <span className="block font-semibold">{acc.label}</span>
              <span className="text-slate-400">Klik untuk isi otomatis</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
