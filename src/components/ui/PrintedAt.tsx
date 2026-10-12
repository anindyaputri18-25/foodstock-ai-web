"use client";

import { useEffect, useState } from "react";

/** Waktu saat ini yang dirender setelah mount (menghindari mismatch hidrasi server vs klien). */
export function PrintedAt() {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(new Date().toLocaleString("id-ID"));
  }, []);
  return <span suppressHydrationWarning>{text || "…"}</span>;
}
