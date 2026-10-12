#!/usr/bin/env node
/**
 * Generator override TEMA TERANG.
 *
 * Latar belakang: seluruh komponen ditulis dengan kelas Tailwind bernuansa gelap
 * (mis. text-amber-400/90, bg-[#061a14], border-rose-800). Mode terang bekerja dengan
 * menimpa kelas-kelas itu lewat CSS di app/globals.css. Menulisnya manual satu per satu
 * membuat variasi baru mudah terlewat, sehingga elemen tertentu tetap gelap.
 *
 * Skrip ini memindai SEMUA kelas yang dipakai di app/ dan src/, lalu menulis aturan
 * terang untuk kelas yang belum ada di bagian CSS manual. Hasil ditulis di antara
 * penanda BEGIN/END GENERATED pada app/globals.css (idempoten, aman dijalankan ulang).
 *
 * Jalankan setelah menambah kelas warna baru:   npm run theme:gen
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CSS_PATH = join(ROOT, "app/globals.css");
const BEGIN = "/* ===== BEGIN GENERATED LIGHT OVERRIDES (npm run theme:gen) ===== */";
const END = "/* ===== END GENERATED LIGHT OVERRIDES ===== */";

// Palet Tailwind (hanya shade yang dibutuhkan): 50/100 = tint latar, 200 = garis, 600/700 = teks.
const P = {
  emerald: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 600: "#059669", 700: "#047857" },
  rose: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 600: "#e11d48", 700: "#be123c" },
  sky: { 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 600: "#0284c7", 700: "#0369a1" },
  amber: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 600: "#d97706", 700: "#b45309" },
  teal: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 600: "#0d9488", 700: "#0f766e" },
  lime: { 50: "#f7fee7", 100: "#ecfccb", 200: "#d9f99d", 600: "#65a30d", 700: "#4d7c0f" },
  orange: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 600: "#ea580c", 700: "#c2410c" },
  violet: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 600: "#7c3aed", 700: "#6d28d9" },
  cyan: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 600: "#0891b2", 700: "#0e7490" },
  indigo: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 600: "#4f46e5", 700: "#4338ca" },
  purple: { 50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 600: "#9333ea", 700: "#7e22ce" },
  fuchsia: { 50: "#fdf4ff", 100: "#fae8ff", 200: "#f5d0fe", 600: "#c026d3", 700: "#a21caf" },
  red: { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 600: "#dc2626", 700: "#b91c1c" },
  yellow: { 50: "#fefce8", 100: "#fef9c3", 200: "#fef08a", 600: "#ca8a04", 700: "#a16207" },
  blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 600: "#2563eb", 700: "#1d4ed8" },
  green: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 600: "#16a34a", 700: "#15803d" },
  pink: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 600: "#db2777", 700: "#be185d" },
};
const NEUTRAL = new Set(["slate", "gray", "zinc", "neutral", "stone"]);
const SLATE_TEXT = { 100: "#15332a", 200: "#1f3d31", 300: "#3c5a4e", 400: "#587367", 500: "#6f857b", 600: "#7a8f85" };
const colorNames = [...Object.keys(P), ...NEUTRAL].join("|");

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    if (f === "node_modules" || f === ".next") continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if ([".tsx", ".ts"].includes(extname(p))) out.push(p);
  }
  return out;
}

// 1) Kumpulkan token kelas
const tokens = new Set();
for (const file of [...walk(join(ROOT, "app")), ...walk(join(ROOT, "src"))]) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/[A-Za-z0-9_:\/\[\]#.%!-]+/g)) tokens.add(m[0]);
}

// 2) CSS manual (di luar blok generated) -> untuk menghindari duplikasi
const css = readFileSync(CSS_PATH, "utf8");
const bi = css.indexOf(BEGIN);
const manual = bi === -1 ? css : css.slice(0, bi) + (css.includes(END) ? css.slice(css.indexOf(END) + END.length) : "");

const covered = (tok) => manual.includes(`"${tok}"`) || (/^(hover:)?bg-\[#/.test(tok) && manual.includes(tok.replace(/\/\d+$/, "")));
const esc = (tok) => tok.replace(/([:\/\[\]#.%!])/g, "\\$1");
// Selector dasar: hanya di dalam .dash-shell, bukan panel .keep-dark.
const sel = (tok, hover) => `html[data-theme="light"] .dash-shell [class~="${tok}"]${hover ? ":hover" : ""}:not(.keep-dark *)`;

const rules = [];
const add = (tok, hover, decl, childSel = "") => rules.push(`${sel(tok, hover)}${childSel}{${decl}}`);

const reText = new RegExp(`^(hover:)?text-(${colorNames})-(\\d{2,3})(?:/(\\d+))?$`);
const reBg = new RegExp(`^(hover:)?bg-(${colorNames})-(\\d{2,3})(?:/(\\d+))?$`);
const reBorder = new RegExp(`^(hover:)?border-(${colorNames})-(\\d{2,3})(?:/(\\d+))?$`);
const reDivide = new RegExp(`^divide-(${colorNames})-(\\d{2,3})(?:/(\\d+))?$`);
const reHexBg = /^(hover:)?bg-\[(#[0-9a-fA-F]{6})\](?:\/(\d+))?$/;
const lumHex = (h) => { const n = parseInt(h.slice(1), 16); const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

const counts = { text: 0, bg: 0, border: 0, divide: 0, hex: 0 };
for (const tok of [...tokens].sort()) {
  if (covered(tok)) continue;
  let m;
  if ((m = tok.match(reText))) {
    const [, hov, c, sStr] = m; const s = Number(sStr);
    if (NEUTRAL.has(c)) {
      if (SLATE_TEXT[s]) { add(tok, !!hov, `color:${SLATE_TEXT[s]}`); counts.text++; }
    } else if (s <= 500 && P[c]) { add(tok, !!hov, `color:${P[c][s === 500 ? 600 : 700]}`); counts.text++; }
  } else if ((m = tok.match(reBg))) {
    const [, hov, c, sStr, op] = m; const s = Number(sStr);
    if (s >= 700) {
      if (NEUTRAL.has(c)) { add(tok, !!hov, `background-color:${s >= 800 ? "#eef2f0" : "#e2e8e5"}`); counts.bg++; }
      else if (P[c]) { add(tok, !!hov, `background-color:${P[c][op && Number(op) > 40 ? 100 : 50]}`); counts.bg++; }
    }
  } else if ((m = tok.match(reBorder))) {
    const [, hov, c, sStr] = m; const s = Number(sStr);
    if (s >= 700) {
      if (NEUTRAL.has(c)) { add(tok, !!hov, "border-color:#cbd5d1"); counts.border++; }
      else if (P[c]) { add(tok, !!hov, `border-color:${P[c][200]}`); counts.border++; }
    }
  } else if ((m = tok.match(reDivide))) {
    const [, c, sStr] = m; const s = Number(sStr);
    if (s >= 700) { add(tok, false, `border-color:${NEUTRAL.has(c) ? "#cbd5d1" : P[c]?.[200] ?? "#d9ece1"}`, " > :not(:last-child)"); counts.divide++; }
  } else if ((m = tok.match(reHexBg))) {
    const [, hov, hex] = m;
    if (lumHex(hex) < 0.08) { add(tok, !!hov, "background-color:#f2f9f5"); counts.hex++; }
  }
}

const block = `${BEGIN}\n/* Jangan diedit manual: dihasilkan oleh scripts/gen-light-theme.mjs */\n${rules.join("\n")}\n${END}`;
let next;
if (bi === -1) next = css.replace(/\n@media print/, `\n${block}\n\n@media print`);
else next = css.slice(0, bi) + block + css.slice(css.indexOf(END) + END.length);
if (bi === -1 && next === css) next = css + "\n" + block + "\n";
writeFileSync(CSS_PATH, next);
console.log(`Aturan terang dihasilkan: ${rules.length}`, counts);
