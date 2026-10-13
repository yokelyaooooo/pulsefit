import { cn } from "@/lib/utils"

const palette = ["#FF3B30", "#FF9500", "#FF9F0A", "#34C759", "#00C7BE", "#32ADE6", "#007AFF", "#5856D6", "#AF52DE"]

function tint(glyph: string) {
  const hash = Array.from(glyph).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return palette[hash % palette.length]
}

export function ExerciseIcon({ glyph, className }: { glyph: string; className?: string }) {
  const color = tint(glyph)
  return (
    <svg viewBox="0 0 32 32" className={cn("shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill={color} opacity="0.14" />
      <path d={glyph} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
