import type { MuscleId, SetEntry, WorkoutLog } from "@/lib/trainlog/types"

export function setVolumeKg(set: SetEntry) {
  if (set.kind !== "work") return 0
  const reps = Math.max(0, set.reps)
  if (set.mode === "dumbbell") {
    const right = set.kgRight ?? set.kg
    return (Math.max(0, set.kg) + Math.max(0, right)) * reps
  }
  return Math.max(0, set.kg) * reps
}

export function logVolumeKg(log: WorkoutLog) {
  return log.exercises.reduce(
    (total, exercise) => total + exercise.sets.reduce((sum, set) => sum + setVolumeKg(set), 0),
    0
  )
}

export function logCardioSeconds(log: WorkoutLog) {
  return log.exercises.reduce(
    (total, exercise) =>
      total + exercise.sets.reduce((sum, set) => sum + (set.kind === "cardio" ? Math.max(0, set.seconds) : 0), 0),
    0
  )
}

export function estimateKcal(volumeKg: number, cardioSec: number, durationSec: number) {
  const minutes = Math.max(0, durationSec) / 60
  return Math.round(volumeKg * 0.004 + cardioSec * 0.12 + minutes * 3.2)
}

export function activeMuscles(
  log: WorkoutLog,
  lookup: (exerciseId: string) => { muscles: MuscleId[] } | undefined
) {
  const found = new Set<MuscleId>()
  for (const exercise of log.exercises) {
    const worked = exercise.sets.some((set) => set.kind === "work" || set.kind === "cardio")
    if (!worked) continue
    lookup(exercise.exerciseId)?.muscles.forEach((muscle) => found.add(muscle))
  }
  return [...found]
}

export function formatLoad(set: SetEntry) {
  if (set.kind === "cardio") return `${set.label || "有氧"} ${Math.round(set.seconds)} 秒`
  if (set.mode === "dumbbell") {
    const right = set.kgRight ?? set.kg
    return `(${trimNum(set.kg)}+${trimNum(right)})kg × ${trimNum(set.reps)}`
  }
  if (set.mode === "bodyweight" && set.kg <= 0) return `${trimNum(set.reps)} 次`
  return `${trimNum(set.kg)}kg × ${trimNum(set.reps)}`
}

function trimNum(value: number) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10)
}

export function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function shareCardSvg(input: {
  title: string
  date: string
  volumeKg: number
  kcal: number
  durationSec: number
  muscles: string[]
}) {
  const minutes = Math.round(input.durationSec / 60)
  const muscles = input.muscles.slice(0, 8).join(" · ") || "还没有部位"
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440">
  <rect width="1080" height="1440" rx="48" fill="#101114"/>
  <text x="80" y="160" fill="#ffb199" font-size="28" font-family="sans-serif">燃律 PulseFit · 训记</text>
  <text x="80" y="280" fill="#f5f5f4" font-size="72" font-family="sans-serif">${escapeXml(input.title)}</text>
  <text x="80" y="350" fill="#a8a29e" font-size="32" font-family="sans-serif">${escapeXml(input.date)}</text>
  <text x="80" y="560" fill="#f5f5f4" font-size="84" font-family="sans-serif">${Math.round(input.volumeKg)} kg</text>
  <text x="80" y="620" fill="#a8a29e" font-size="28" font-family="sans-serif">总容量 · 只计正式组</text>
  <text x="80" y="780" fill="#f5f5f4" font-size="64" font-family="sans-serif">${input.kcal} kcal</text>
  <text x="560" y="780" fill="#f5f5f4" font-size="64" font-family="sans-serif">${minutes} 分钟</text>
  <text x="80" y="980" fill="#a8a29e" font-size="28" font-family="sans-serif">练到</text>
  <text x="80" y="1060" fill="#f5f5f4" font-size="36" font-family="sans-serif">${escapeXml(muscles)}</text>
  <text x="80" y="1320" fill="#78716c" font-size="24" font-family="sans-serif">热量是估算：容量×0.004 + 组间有氧秒×0.12 + 分钟×3.2</text>
</svg>`
}
