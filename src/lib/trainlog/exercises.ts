import type { ExerciseDef, MuscleId } from "@/lib/trainlog/types"

type Seed = Omit<ExerciseDef, "builtin" | "glyph"> & { glyph: string }

const seeds: Seed[] = [
  { id: "bench-barbell", name: "平板卧推", muscles: ["chest", "triceps", "front-delt"], equipment: "barbell", focus: ["push"], defaultMode: "barbell", glyph: "M5 21h22M8 21V15h16v6M12 15c1.5-4 6.5-4 8 0M16 9v3" },
  { id: "incline-barbell", name: "上斜杠铃卧推", muscles: ["chest", "front-delt", "triceps"], equipment: "barbell", focus: ["push"], defaultMode: "barbell", glyph: "M6 24 22 16M8 23l2-2h12l2 2M14 14l2-4 2 4" },
  { id: "incline-dumbbell", name: "上斜哑铃卧推", muscles: ["chest", "front-delt"], equipment: "dumbbell", focus: ["push"], defaultMode: "dumbbell", glyph: "M7 23l10-8 8 4M9 20h4M18 16h4M14 9v4" },
  { id: "decline-bench", name: "下斜卧推", muscles: ["chest", "triceps"], equipment: "barbell", focus: ["push"], defaultMode: "barbell", glyph: "M6 14h20M8 14v6h16v-6M12 20c2 3 6 3 8 0" },
  { id: "db-bench", name: "哑铃卧推", muscles: ["chest", "triceps", "front-delt"], equipment: "dumbbell", focus: ["push"], defaultMode: "dumbbell", glyph: "M6 18h6M20 18h6M9 16v4M23 16v4M12 18c2-5 6-5 8 0" },
  { id: "dip", name: "双杠臂屈伸", muscles: ["chest", "triceps", "front-delt"], equipment: "bodyweight", focus: ["push"], defaultMode: "bodyweight", glyph: "M8 6v20M24 6v20M10 12h12M16 12v8M13 23h6" },
  { id: "cable-fly", name: "绳索夹胸", muscles: ["chest"], equipment: "cable", focus: ["push"], defaultMode: "machine", glyph: "M6 8c6 4 6 12 0 16M26 8c-6 4-6 12 0 16M12 16h8" },
  { id: "machine-press", name: "器械推胸", muscles: ["chest", "triceps"], equipment: "machine", focus: ["push"], defaultMode: "machine", glyph: "M7 8h18v16H7zM11 16h10M21 13l3 3-3 3" },
  { id: "close-grip", name: "窄距卧推", muscles: ["triceps", "chest"], equipment: "barbell", focus: ["push"], defaultMode: "barbell", glyph: "M5 22h22M14 22v-7h4v7M16 11v4M13 12h6" },
  { id: "overhead-ext", name: "过头臂屈伸", muscles: ["triceps"], equipment: "dumbbell", focus: ["push"], defaultMode: "dumbbell", glyph: "M16 6v8M12 6h8M16 14v6M11 26c2-4 8-4 10 0" },
  { id: "deadlift", name: "传统硬拉", muscles: ["hamstrings", "glutes", "lower-back", "traps"], equipment: "barbell", focus: ["pull"], defaultMode: "barbell", glyph: "M6 25h20M9 25V13h14v12M16 7v6M12 9h8" },
  { id: "sumo-deadlift", name: "相扑硬拉", muscles: ["glutes", "quads", "hamstrings"], equipment: "barbell", focus: ["pull", "legs"], defaultMode: "barbell", glyph: "M5 24h22M8 24l5-10h6l5 10M16 8v6" },
  { id: "barbell-row", name: "杠铃划船", muscles: ["lats", "upper-back", "biceps"], equipment: "barbell", focus: ["pull"], defaultMode: "barbell", glyph: "M6 20h20M8 20l6-8h4l6 8M16 8v4" },
  { id: "db-row", name: "哑铃划船", muscles: ["lats", "upper-back", "biceps"], equipment: "dumbbell", focus: ["pull"], defaultMode: "dumbbell", glyph: "M8 24V10M8 14h8l6 6M22 16v6M20 16h6" },
  { id: "pullup", name: "引体向上", muscles: ["lats", "biceps", "upper-back"], equipment: "bodyweight", focus: ["pull"], defaultMode: "bodyweight", glyph: "M6 7h20M10 7v4M22 7v4M12 11l4 5 4-5M16 16v8" },
  { id: "lat-pulldown", name: "高位下拉", muscles: ["lats", "biceps"], equipment: "cable", focus: ["pull"], defaultMode: "machine", glyph: "M8 6h16M16 6v6M10 12h12M16 12v10M12 24h8" },
  { id: "seated-row", name: "坐姿划船", muscles: ["lats", "upper-back", "biceps"], equipment: "cable", focus: ["pull"], defaultMode: "machine", glyph: "M5 20h10M18 16h8M22 13v6M8 20v6h8M14 14l4 2" },
  { id: "face-pull", name: "面拉", muscles: ["rear-delt", "upper-back"], equipment: "cable", focus: ["pull", "shoulders"], defaultMode: "machine", glyph: "M6 16h8M18 12l6-3M18 20l6 3M16 9v14" },
  { id: "barbell-curl", name: "杠铃弯举", muscles: ["biceps", "forearm"], equipment: "barbell", focus: ["pull"], defaultMode: "barbell", glyph: "M7 22h18M10 22c0-8 12-8 12 0M16 8v6" },
  { id: "db-curl", name: "哑铃弯举", muscles: ["biceps"], equipment: "dumbbell", focus: ["pull"], defaultMode: "dumbbell", glyph: "M8 23c0-7 6-7 6 0M8 21h6M18 14c0-6 6-6 6 0M18 12h6" },
  { id: "hammer-curl", name: "锤式弯举", muscles: ["biceps", "forearm"], equipment: "dumbbell", focus: ["pull"], defaultMode: "dumbbell", glyph: "M11 24V12M9 12h4M21 24V10M19 10h4M14 18h4" },
  { id: "squat", name: "深蹲", muscles: ["quads", "glutes", "hamstrings"], equipment: "barbell", focus: ["legs"], defaultMode: "barbell", glyph: "M16 6a2 2 0 1 0 .1 0M16 8v6M10 24l6-8 6 8M11 27l5-5 5 5M8 10h16" },
  { id: "front-squat", name: "前蹲", muscles: ["quads", "abs", "glutes"], equipment: "barbell", focus: ["legs"], defaultMode: "barbell", glyph: "M16 7v7M9 16h14M11 26l5-8 5 8M12 28l4-4 4 4" },
  { id: "bulgarian", name: "保加利亚分腿蹲", muscles: ["quads", "glutes"], equipment: "dumbbell", focus: ["legs"], defaultMode: "dumbbell", glyph: "M12 24V12M12 18h5M20 26v-8M18 16h6M8 26h8" },
  { id: "leg-press", name: "腿举", muscles: ["quads", "glutes"], equipment: "machine", focus: ["legs"], defaultMode: "machine", glyph: "M6 22h12l8-10H14zM10 18h6M20 8v6" },
  { id: "rdl", name: "罗马尼亚硬拉", muscles: ["hamstrings", "glutes", "lower-back"], equipment: "barbell", focus: ["legs", "pull"], defaultMode: "barbell", glyph: "M7 16h18M10 16v8M22 16v8M16 8v8M13 10h6" },
  { id: "hip-thrust", name: "臀推", muscles: ["glutes", "hamstrings"], equipment: "barbell", focus: ["legs"], defaultMode: "barbell", glyph: "M5 22h8M19 22h8M8 22c2-7 14-7 16 0M16 12v4" },
  { id: "leg-curl", name: "腿弯举", muscles: ["hamstrings"], equipment: "machine", focus: ["legs"], defaultMode: "machine", glyph: "M6 20h14M18 20c4 0 6-6 2-8M8 14v10M22 12v4" },
  { id: "leg-ext", name: "腿屈伸", muscles: ["quads"], equipment: "machine", focus: ["legs"], defaultMode: "machine", glyph: "M7 18h12M19 18l6-6M9 12v10M24 10v4" },
  { id: "calf-raise", name: "站姿提踵", muscles: ["calves"], equipment: "machine", focus: ["legs"], defaultMode: "machine", glyph: "M12 26V14M20 26V14M8 26h16M14 10h4M16 6v4" },
  { id: "lunge", name: "箭步蹲", muscles: ["quads", "glutes"], equipment: "dumbbell", focus: ["legs"], defaultMode: "dumbbell", glyph: "M13 24V8M13 16l8 8M9 24h8M21 26h4M10 8h6" },
  { id: "ohp", name: "坐姿肩上推举", muscles: ["front-delt", "side-delt", "triceps"], equipment: "barbell", focus: ["shoulders"], defaultMode: "barbell", glyph: "M7 11h18M10 11v5h12v-5M16 16v8M12 26h8" },
  { id: "arnold", name: "阿诺德推举", muscles: ["front-delt", "side-delt"], equipment: "dumbbell", focus: ["shoulders"], defaultMode: "dumbbell", glyph: "M8 14c4-6 12-6 16 0M10 14v5M22 14v5M16 18v6" },
  { id: "lateral", name: "侧平举", muscles: ["side-delt"], equipment: "dumbbell", focus: ["shoulders"], defaultMode: "dumbbell", glyph: "M16 20V8M6 16h6M20 16h6M8 14v4M24 14v4" },
  { id: "front-raise", name: "前平举", muscles: ["front-delt"], equipment: "dumbbell", focus: ["shoulders"], defaultMode: "dumbbell", glyph: "M10 24c2-10 10-10 12 0M12 16h8M14 12h4" },
  { id: "rear-fly", name: "俯身飞鸟", muscles: ["rear-delt", "upper-back"], equipment: "dumbbell", focus: ["shoulders", "pull"], defaultMode: "dumbbell", glyph: "M16 22V12M7 14l6 4M25 14l-6 4M8 12h4M20 12h4" },
  { id: "upright-row", name: "直立划船", muscles: ["side-delt", "traps"], equipment: "barbell", focus: ["shoulders", "pull"], defaultMode: "barbell", glyph: "M7 20h18M10 20V12M22 20V12M12 12h8M16 8v4" },
  { id: "shrug", name: "耸肩", muscles: ["traps"], equipment: "barbell", focus: ["shoulders", "pull"], defaultMode: "barbell", glyph: "M6 22h20M9 22v-4M23 22v-4M10 12c2-4 10-4 12 0M16 7v3" },
  { id: "run", name: "跑步", muscles: ["quads", "hamstrings", "calves"], equipment: "cardio", focus: ["cardio"], defaultMode: "bodyweight", glyph: "M11 8a2 2 0 1 0 .1 0M9 24l5-7 3 3 5-8M8 18l4 2M20 24h6" },
  { id: "rower", name: "划船机", muscles: ["lats", "quads", "upper-back"], equipment: "cardio", focus: ["cardio", "pull"], defaultMode: "machine", glyph: "M5 22h22M8 22V16h6l8-6M16 10v6M22 8v4" },
  { id: "bike", name: "单车", muscles: ["quads", "calves"], equipment: "cardio", focus: ["cardio"], defaultMode: "machine", glyph: "M9 22a4 4 0 1 0 .1 0M23 22a4 4 0 1 0 .1 0M9 22l6-8 5 6 3-6M14 10h6" },
  { id: "burpee", name: "波比", muscles: ["chest", "quads", "abs"], equipment: "bodyweight", focus: ["cardio"], defaultMode: "bodyweight", glyph: "M6 24h20M8 24l4-6h8l4 6M12 18V12h8v6M16 8v4" },
  { id: "jack", name: "开合跳", muscles: ["calves", "quads", "side-delt"], equipment: "bodyweight", focus: ["cardio"], defaultMode: "bodyweight", glyph: "M16 7v6M8 12l8 4 8-4M10 26l6-9 6 9" },
  { id: "mountain", name: "登山跑", muscles: ["abs", "quads", "front-delt"], equipment: "bodyweight", focus: ["cardio", "core"], defaultMode: "bodyweight", glyph: "M6 22l10-12 10 12M12 16l4 6M20 14l-3 8" },
  { id: "crunch", name: "卷腹", muscles: ["abs"], equipment: "bodyweight", focus: ["core"], defaultMode: "bodyweight", glyph: "M7 22c4-2 14-2 18 0M10 18c3-5 9-5 12 0M14 12h4" },
  { id: "hanging-leg", name: "悬垂举腿", muscles: ["abs", "forearm"], equipment: "bodyweight", focus: ["core"], defaultMode: "bodyweight", glyph: "M8 6h16M12 6v5M20 6v5M16 11v6M12 23l4-6 4 6" },
  { id: "plank", name: "平板支撑", muscles: ["abs", "front-delt", "obliques"], equipment: "bodyweight", focus: ["core"], defaultMode: "bodyweight", glyph: "M5 20h14l6-6M8 20v4M19 20v3M24 12v4" },
  { id: "russian", name: "俄罗斯转体", muscles: ["obliques", "abs"], equipment: "bodyweight", focus: ["core"], defaultMode: "bodyweight", glyph: "M8 20h16M16 20V12M10 14l6 2 6-4M7 24h6M19 24h6" },
]

export const builtinExercises: ExerciseDef[] = seeds.map((seed) => ({ ...seed, builtin: true }))

export function monogramGlyph(name: string) {
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const peak = 6 + (hash % 7)
  const gap = 8 + ((hash >> 2) % 8)
  return `M6 26 L16 ${peak} L26 26 M${gap} 16 H${32 - gap} M16 8 v5`
}

export function getBuiltinExercise(id: string) {
  return builtinExercises.find((exercise) => exercise.id === id)
}

export function musclesOf(ids: string[]): MuscleId[] {
  const found = new Set<MuscleId>()
  ids.forEach((id) => getBuiltinExercise(id)?.muscles.forEach((muscle) => found.add(muscle)))
  return [...found]
}
