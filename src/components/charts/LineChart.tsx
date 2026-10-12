"use client";

import { useId } from "react";

interface Series {
  label: string;
  color: string;
  values: number[];
}

export function LineChart({
  labels,
  series,
  height = 220,
}: {
  labels: string[];
  series: Series[];
  height?: number;
}) {
  const width = 700;
  const padding = { top: 16, right: 16, bottom: 28, left: 44 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(1, ...allValues);
  const min = Math.min(0, ...allValues);
  const range = max - min || 1;

  const xFor = (i: number) => padding.left + (i / Math.max(1, labels.length - 1)) * innerW;
  const yFor = (v: number) => padding.top + innerH - ((v - min) / range) * innerH;

  const gridLines = 4;
  const uid = useId().replace(/:/g, "");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Grafik tren">
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = padding.top + (innerH / gridLines) * i;
        const val = Math.round(max - (range / gridLines) * i);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" strokeWidth={1} />
            <text x={padding.left - 8} y={y + 4} fontSize={10} fill="#64748b" textAnchor="end">
              {val}
            </text>
          </g>
        );
      })}
      {labels.map((l, i) => {
        if (labels.length > 10 && i % Math.ceil(labels.length / 8) !== 0) return null;
        return (
          <text key={i} x={xFor(i)} y={height - 8} fontSize={9} fill="#64748b" textAnchor="middle">
            {l}
          </text>
        );
      })}
      <defs>
        {series.map((s, i) => (
          <linearGradient key={s.label} id={`${uid}-g${i}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={s.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {series.map((s, i) => {
        if (s.values.length < 2) return null;
        const base = padding.top + innerH;
        const area = `M${xFor(0)},${base} ` + s.values.map((v, j) => `L${xFor(j)},${yFor(v)}`).join(" ") + ` L${xFor(s.values.length - 1)},${base} Z`;
        return <path key={`a-${s.label}`} d={area} fill={`url(#${uid}-g${i})`} />;
      })}
      {series.map((s) => {
        const d = s.values.map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(v)}`).join(" ");
        return <path key={s.label} d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </svg>
  );
}

export function LineChartLegend({ series }: { series: Series[] }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
      {series.map((s) => (
        <span key={s.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}
