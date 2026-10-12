"use client";

export function GaugeChart({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = 70;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (clamped / 100) * circumference;
  const color = clamped < 30 ? "#fb7185" : clamped < 60 ? "#fbbf24" : "#34d399";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 180 100" className="w-full max-w-[220px] text-white">
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth={14} strokeLinecap="round" />
        <path
          d="M 10 90 A 80 80 0 0 1 170 90"
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text x="90" y="80" textAnchor="middle" fontSize="26" fontWeight={700} fill="currentColor">
          {clamped.toFixed(0)}%
        </text>
      </svg>
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}
