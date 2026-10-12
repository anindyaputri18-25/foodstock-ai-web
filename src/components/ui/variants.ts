import { cva } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 shadow-md shadow-emerald-950/40 hover:from-emerald-400 hover:to-teal-400 hover:-translate-y-0.5",
        outline: "border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400",
        ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
        danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-500",
        subtle: "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10",
      },
      size: {
        sm: "text-xs px-3 py-1.5",
        md: "text-sm px-4 py-2.5",
        lg: "text-base px-5 py-3",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export const badgeVariants = cva(
  "inline-flex items-center rounded-full font-semibold tracking-wide text-[11px] px-2.5 py-1 border",
  {
    variants: {
      status: {
        aman: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        shortage: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        surplus: "bg-sky-500/15 text-sky-300 border-sky-500/30",
        info: "bg-slate-500/15 text-slate-300 border-slate-500/30",
        warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        aktif: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        ditolak: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        terkunci: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        menunggu: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        disetujui: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        eskalasi: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        selesai: "bg-sky-500/15 text-sky-300 border-sky-500/30",
        rencana: "bg-slate-500/15 text-slate-300 border-slate-500/30",
        dikirim: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        terkirim: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        gagal: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      },
    },
    defaultVariants: { status: "info" },
  },
);

export const cardVariants = cva("agri-card", {
  variants: {
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    },
  },
  defaultVariants: { padding: "md" },
});
