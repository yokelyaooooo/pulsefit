export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function sixteenthDuration(bpm: number) {
  return 60 / bpm / 4
}

export function sixteenthIndex(positionSec: number, bpm: number) {
  if (positionSec <= 0 || bpm <= 0) return 0
  return Math.floor(positionSec / sixteenthDuration(bpm))
}

export function formatClock(sec: number) {
  const safe = Number.isFinite(sec) ? Math.max(0, Math.floor(sec)) : 0
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
