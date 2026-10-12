import { Cpu } from "lucide-react";

export function Logo({ withText = true, className }: { withText?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 shadow-lg shadow-emerald-500/10">
        <Cpu className="h-[18px] w-[18px] text-emerald-400" />
      </span>
      {withText && (
        <span className="text-[15px] font-extrabold tracking-wider text-white">
          FOODSTOCK<span className="text-emerald-400">.AI</span>
        </span>
      )}
    </div>
  );
}
