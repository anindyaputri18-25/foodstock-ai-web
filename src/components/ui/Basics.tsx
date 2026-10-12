"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
import { badgeVariants, buttonVariants, cardVariants, cn } from "./variants";
import { Loader2 } from "lucide-react";

export function Button({
  className,
  variant,
  size,
  loading,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  // Jika pemanggil memberi warna latar sendiri (mis. bg-emerald-600), gradien bawaan varian
  // "primary" dihapus agar tidak menutupi warna itu (teks putih di atas gradien terang berkontras rendah).
  const customBg = typeof className === "string" && /(^|\s)bg-(?!gradient|none)[a-z]+-\d{2,3}(?!\/)/.test(className);
  return (
    <button className={cn(buttonVariants({ variant, size }), customBg && "bg-none", className)} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Badge({
  className,
  status,
  children,
}: { className?: string; children: ReactNode } & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ status }), className)}>{children}</span>;
}

export function Card({
  className,
  padding,
  children,
}: { className?: string; children: ReactNode } & VariantProps<typeof cardVariants>) {
  return <div className={cn(cardVariants({ padding }), className)}>{children}</div>;
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-300">
        {label}
      </label>
      {children}
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error && <span className="text-xs font-medium text-rose-400">{error}</span>}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-emerald-900/50 bg-[#051410]/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-emerald-900/50 bg-[#051410]/80 px-4 py-2.5 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-slate-500">{text}</p>;
}

export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-white/5" />
      ))}
    </div>
  );
}

type StatTone = "default" | "emerald" | "rose" | "sky" | "amber" | "violet";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  accent = false,
  gradient,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: StatTone;
  accent?: boolean;
  gradient?: "sky" | "violet" | "amber" | "teal";
}) {
  const valueColor = {
    default: "text-white",
    emerald: "text-emerald-300",
    rose: "text-rose-300",
    sky: "text-sky-300",
    amber: "text-amber-300",
    violet: "text-violet-300",
  }[tone];
  const chip = {
    default: "bg-emerald-500/20 text-emerald-300",
    emerald: "bg-emerald-500/20 text-emerald-300",
    rose: "bg-rose-500/20 text-rose-300",
    sky: "bg-sky-500/20 text-sky-300",
    amber: "bg-amber-500/20 text-amber-300",
    violet: "bg-violet-500/20 text-violet-300",
  }[tone];

  if (gradient) {
    return (
      <div className={`grad-card grad-${gradient} p-5`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold opacity-85">{label}</p>
          {Icon && <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/25"><Icon className="h-4 w-4" /></span>}
        </div>
        <p className="mt-3 text-3xl font-extrabold">{value}</p>
        {hint && <p className="mt-1 text-xs font-medium opacity-85">{hint}</p>}
      </div>
    );
  }

  if (accent) {
    return (
      <div className="accent-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold opacity-70">{label}</p>
          {Icon && <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950/10"><Icon className="h-4 w-4" /></span>}
        </div>
        <p className="mt-3 text-3xl font-extrabold">{value}</p>
        {hint && <p className="mt-1 text-xs font-medium opacity-70">{hint}</p>}
      </div>
    );
  }

  const tint = tone === "default" ? "" : `tint-${tone}`;
  return (
    <div className={`agri-card ${tint} p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        {Icon && <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${chip}`}><Icon className="h-4 w-4" /></span>}
      </div>
      <p className={`mt-3 text-3xl font-extrabold ${valueColor}`}>{value}</p>
      {hint && <div className="mt-1.5 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
