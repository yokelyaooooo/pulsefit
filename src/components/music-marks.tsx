import { cn } from "@/lib/utils"

export function Equalizer({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-3.5 items-end gap-[2px] text-[#ff2d55]", className)} aria-hidden>
      {[0, 1, 2, 3].map((bar) => (
        <span key={bar} className="eq-bar w-[3px] rounded-full bg-current" style={{ animationDelay: `${bar * 0.12}s` }} />
      ))}
    </span>
  )
}

export function BpmMark({ bpm, className }: { bpm: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white tabular-nums backdrop-blur-md", className)}>
      <Equalizer className="h-2.5 text-white" />
      {bpm}
    </span>
  )
}

export function Waveform({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 18" className={cn("h-4 w-16 text-[#ff2d55]", className)} aria-hidden>
      <path
        d="M1 9h4l3-6 3 12 3-8 3 4 4-7 3 10 3-5h6l3 6 3-12 3 8 3-4 4 7 3-10 3 5h8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function VinylDisc({ className, spinning }: { className?: string; spinning?: boolean }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-1/2 right-0 size-[84%] -translate-y-1/2 rounded-full",
        "bg-[radial-gradient(circle_at_center,#f4f4f6_0_16%,#1c1c1e_17%_20%,#3a3a3c_21%_27%,#111_28%_34%,#2c2c2e_35%_48%,#111_49%_70%,#1c1c1e_71%)]",
        spinning ? "vinyl-spin" : "",
        className
      )}
      aria-hidden
    />
  )
}
