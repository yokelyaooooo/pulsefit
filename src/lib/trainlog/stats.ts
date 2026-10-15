import type { MuscleId, SetEntry, WorkoutLog } from "@/lib/trainlog/types"

export function setVolumeKg(set: SetEntry) {
  if ((set.kind !== "work" && set.kind !== "drop") || set.completed === false) return 0
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
      total + exercise.sets.reduce((sum, set) => sum + (set.kind === "cardio" && set.completed !== false ? Math.max(0, set.seconds) : 0), 0),
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
    const worked = exercise.sets.some((set) => set.completed !== false && (set.kind === "work" || set.kind === "drop" || set.kind === "cardio"))
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
  exercises?: WorkoutLog["exercises"]
  bodySvgs?: string[]
  notes?: string
}) {
  const minutes = Math.max(1, Math.round(input.durationSec / 60))
  let cursor = 810
  const rows = (input.exercises ?? []).map((entry) => {
    const top = cursor
    const sets = entry.sets.filter((set) => set.completed !== false)
    cursor += 100 + Math.ceil(sets.length / 3) * 50 + (entry.notes ? 42 : 0)
    return `<text x="92" y="${top}" font-size="35" font-weight="600">${escapeXml(entry.name.slice(0, 22))}</text>${sets.map((set, index) => `<text x="${92 + index % 3 * 306}" y="${top + 57 + Math.floor(index / 3) * 50}" font-size="23"><tspan fill="#a6a2b8">${set.kind === "warmup" ? "热" : set.kind === "drop" ? "递" : index + 1}</tspan><tspan dx="14">${escapeXml(formatLoad(set))}</tspan></text>`).join("")}${entry.notes ? `<text x="92" y="${cursor - 32}" font-size="22" fill="#8e87a6">${escapeXml(entry.notes.slice(0, 40))}</text>` : ""}`
  }).join("")
  if (input.notes) cursor += 64
  const height = Math.max(1100, cursor + 180)
  const bodies = input.bodySvgs?.map((svg, i) => svg.replace(/<svg\b/, `<svg x="${105 + i * 272}" y="285" width="255" height="325"`)).join("") ?? ""
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}">
  <defs><linearGradient id="bg" x2="0.45" y2="1"><stop stop-color="#eae7fb"/><stop offset="1" stop-color="#f9eee7"/></linearGradient></defs>
  <rect width="1080" height="${height}" fill="url(#bg)"/>
  <g fill="#302957" font-family="-apple-system,PingFang SC,Microsoft YaHei,sans-serif">
  <text x="66" y="90" font-size="30">${escapeXml(input.date)}</text>
  <text x="64" y="170" font-size="58" font-weight="700">${escapeXml(input.title.slice(0, 16))}</text>
  <rect x="44" y="223" width="992" height="445" rx="40" fill="white" fill-opacity=".95"/>
  <text x="85" y="275" font-size="23" fill="#9185bc">PULSEFIT · 今天也更进一步</text>
  ${bodies}
  ${!bodies ? `<text x="90" y="430" font-size="30">${escapeXml(input.muscles.slice(0, 5).join(" · "))}</text>` : ""}
  <g text-anchor="end"><text x="974" y="362" font-size="48" font-weight="700">${input.kcal}</text><text x="974" y="403" font-size="24" fill="#a4a0af">估算消耗 kcal</text>
  <text x="974" y="479" font-size="48" font-weight="700">${Math.round(input.volumeKg)} kg</text><text x="974" y="520" font-size="24" fill="#a4a0af">总容量</text>
  <text x="974" y="594" font-size="48" font-weight="700">${minutes}<tspan font-size="25">m</tspan></text><text x="974" y="635" font-size="24" fill="#a4a0af">训练时长</text></g>
  <rect x="44" y="713" width="992" height="${Math.max(200, cursor - 685)}" rx="40" fill="white" fill-opacity=".95"/>
  ${rows}
  ${input.notes ? `<text x="92" y="${cursor - 10}" font-size="24" fill="#8e87a6">${escapeXml(input.notes.slice(0, 38))}</text>` : ""}
  <text x="65" y="${height - 78}" font-size="26" font-weight="600">燃律 PulseFit · 记录每一次进步</text>
  <text x="65" y="${height - 35}" font-size="19" fill="#a09aac">热身不计入容量，热量为估算值。</text>
  </g>
</svg>`
}
