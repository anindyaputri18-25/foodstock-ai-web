"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="modal-title"
      className="w-full max-w-lg m-auto rounded-2xl border border-emerald-900/50 bg-[#081c16] p-0 text-slate-100 shadow-2xl shadow-black/60"
    >
      <div className="flex items-center justify-between border-b border-emerald-900/30 px-6 py-4">
        <h2 id="modal-title" className="text-lg font-bold text-white">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}
