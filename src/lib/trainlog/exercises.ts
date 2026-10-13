import type { ExerciseDef, MuscleId } from "@/lib/trainlog/types"

type Seed = Omit<ExerciseDef, "builtin" | "glyph"> & { glyph: string }

const seeds: Seed[] = [
  { id: "bench-barbell", name: "平板卧推", muscles: ["chest", "triceps", "front-delt"], equipment: "barbell", focus: ["push"], defaultMode: "barbell", glyph: "M5 21.5h22M8.5 21.5V15.2h15v6.3M12.6 15.2c1.2-3.4 5.6-3.4 6.8 0M16 9.2v3.4" },
  { id: "incline-barbell", name: "上斜杠铃卧推", muscles: ["chest", "front-delt", "triceps"], equipment: "barbell", focus: ["push"], defaultMode: "barbell", glyph: "M6.5 23.2 21.8 14.4M9 22h12.2M13.6 13.2 16 9.6l2.4 3.6" },
  { id: "incline-dumbbell", name: "上斜哑铃卧推", muscles: ["chest", "front-delt"], equipment: "dumbbell", focus: ["push"], defaultMode: "dumbbell", glyph: "M7.2 22.4 17 14.6l7.6 3.8M9.2 19.6h3.4M18.2 15.4h3.4M16 8.6v3.8" },
  { id: "decline-bench", name: "下斜卧推", muscles: ["chest", "triceps"], equipment: "barbell", focus: ["push"], defaultMode: "barbell", glyph: "M6 13.6h20M8.5 13.6V20h15v-6.4M12.6 20c1.5 3 5.3 3 6.8 0" },
  { id: "db-bench", name: "哑铃卧推", muscles: ["chest", "triceps", "front-delt"], equipment: "dumbbell", focus: ["push"], defaultMode: "dumbbell", glyph: "M6.2 18.4h6.2M19.6 18.4H26M9 16.2v4.4M23 16.2v4.4M12.2 18.4c1.3-4 6.3-4 7.6 0" },
  { id: "dip", name: "双杠臂屈伸", muscles: ["chest", "triceps", "front-delt"], equipment: "bodyweight", focus: ["push"], defaultMode: "bodyweight", glyph: "M8.2 6.6v18.8M23.8 6.6v18.8M10.6 12.4h10.8M16 12.4v7.2M13.2 23.2h5.6" },
  { id: "cable-fly", name: "绳索夹胸", muscles: ["chest"], equipment: "cable", focus: ["push"], defaultMode: "machine", glyph: "M6.6 8.6c5.8 3.4 5.8 11 0 14.8M25.4 8.6c-5.8 3.4-5.8 11 0 14.8M12.2 16h7.6" },
  { id: "machine-press", name: "器械推胸", muscles: ["chest", "triceps"], equipment: "machine", focus: ["push"], defaultMode: "machine", glyph: "M7.6 8.6h16.8v14.8H7.6zM11.6 16h7.6M20.2 13.2 23.2 16l-3 2.8" },
  { id: "close-grip", name: "窄距卧推", muscles: ["triceps", "chest"], equipment: "barbell", focus: ["push"], defaultMode: "barbell", glyph: "M5 22h22M13.6 22v-6.6h4.8V22M16 11v3.8M13.2 12.2h5.6" },
  { id: "overhead-ext", name: "过头臂屈伸", muscles: ["triceps"], equipment: "dumbbell", focus: ["push"], defaultMode: "dumbbell", glyph: "M16 6.6v7.6M12.2 6.6h7.6M16 14.2v5.2M11.6 25.6c1.5-3.6 7.3-3.6 8.8 0" },
  { id: "deadlift", name: "传统硬拉", muscles: ["hamstrings", "glutes", "lower-back", "traps"], equipment: "barbell", focus: ["pull"], defaultMode: "barbell", glyph: "M6 24.8h20M9.4 24.8V14h13.2v10.8M16 7.6v6.2M12.2 9.2h7.6" },
  { id: "sumo-deadlift", name: "相扑硬拉", muscles: ["glutes", "quads", "hamstrings"], equipment: "barbell", focus: ["pull", "legs"], defaultMode: "barbell", glyph: "M5 23.8h22M8.4 23.8 13.2 14h5.6l4.8 9.8M16 8.4v5.6" },
  { id: "barbell-row", name: "杠铃划船", muscles: ["lats", "upper-back", "biceps"], equipment: "barbell", focus: ["pull"], defaultMode: "barbell", glyph: "M6 20.4h20M8.4 20.4 14 12.6h4l5.6 7.8M16 8.4v3.8" },
  { id: "db-row", name: "哑铃划船", muscles: ["lats", "upper-back", "biceps"], equipment: "dumbbell", focus: ["pull"], defaultMode: "dumbbell", glyph: "M8.4 23.8V10.6M8.4 14.4h7.4l5.8 5.8M22 16.2v5.6M20 16.2h5.2" },
  { id: "pullup", name: "引体向上", muscles: ["lats", "biceps", "upper-back"], equipment: "bodyweight", focus: ["pull"], defaultMode: "bodyweight", glyph: "M6 7.6h20M10.4 7.6v3.8M21.6 7.6v3.8M12.2 11.4 16 16.2l3.8-4.8M16 16.2v7.6" },
  { id: "lat-pulldown", name: "高位下拉", muscles: ["lats", "biceps"], equipment: "cable", focus: ["pull"], defaultMode: "machine", glyph: "M8 6.6h16M16 6.6v5.6M10.4 12.2h11.2M16 12.2v9.2M12.2 23.6h7.6" },
  { id: "seated-row", name: "坐姿划船", muscles: ["lats", "upper-back", "biceps"], equipment: "cable", focus: ["pull"], defaultMode: "machine", glyph: "M5.4 20h9.2M18.4 16.4h7.8M22 13.4v6M8.4 20v5.6h7.2M14 14.4l3.8 2" },
  { id: "face-pull", name: "面拉", muscles: ["rear-delt", "upper-back"], equipment: "cable", focus: ["pull", "shoulders"], defaultMode: "machine", glyph: "M6.4 16h7.6M18.2 12.2 24.2 9.2M18.2 19.8 24.2 22.8M16 9.6v12.8" },
  { id: "barbell-curl", name: "杠铃弯举", muscles: ["biceps", "forearm"], equipment: "barbell", focus: ["pull"], defaultMode: "barbell", glyph: "M7.4 21.8h17.2M10.4 21.8c0-6.8 11.2-6.8 11.2 0M16 8.4v5.6" },
  { id: "db-curl", name: "哑铃弯举", muscles: ["biceps"], equipment: "dumbbell", focus: ["pull"], defaultMode: "dumbbell", glyph: "M8.4 22.8c0-6 5.2-6 5.2 0M8.4 21h5.2M18.4 14.4c0-5 5.2-5 5.2 0M18.4 12.8h5.2" },
  { id: "hammer-curl", name: "锤式弯举", muscles: ["biceps", "forearm"], equipment: "dumbbell", focus: ["pull"], defaultMode: "dumbbell", glyph: "M11.4 23.8V12.4M9.4 12.4h4M21.4 23.8V10.6M19.4 10.6h4M14.4 17.8h3.2" },
  { id: "squat", name: "深蹲", muscles: ["quads", "glutes", "hamstrings"], equipment: "barbell", focus: ["legs"], defaultMode: "barbell", glyph: "M16 6.2a1.7 1.7 0 1 0 .01 0M16 8.2v5.4M10.4 23.6 16 16l5.6 7.6M11.4 26.2 16 21.8l4.6 4.4M8.4 10.4h15.2" },
  { id: "front-squat", name: "前蹲", muscles: ["quads", "abs", "glutes"], equipment: "barbell", focus: ["legs"], defaultMode: "barbell", glyph: "M16 7.4v6.2M9.4 15.8h13.2M11.4 25.2 16 17.8l4.6 7.4M12.2 26.8 16 23.2l3.8 3.6" },
  { id: "bulgarian", name: "保加利亚分腿蹲", muscles: ["quads", "glutes"], equipment: "dumbbell", focus: ["legs"], defaultMode: "dumbbell", glyph: "M12.4 23.8V12.4M12.4 17.8h4.4M20.4 25.6v-7.6M18.4 16.4h5.2M8.4 25.6h7.2" },
  { id: "leg-press", name: "腿举", muscles: ["quads", "glutes"], equipment: "machine", focus: ["legs"], defaultMode: "machine", glyph: "M6.4 21.8h11.2l7.2-9.2H14zM10.4 18h5.2M20.4 8.6v5.2" },
  { id: "rdl", name: "罗马尼亚硬拉", muscles: ["hamstrings", "glutes", "lower-back"], equipment: "barbell", focus: ["legs", "pull"], defaultMode: "barbell", glyph: "M7.4 16.4h17.2M10.4 16.4v7.6M21.6 16.4v7.6M16 8.4v7.6M13.2 10.2h5.6" },
  { id: "hip-thrust", name: "臀推", muscles: ["glutes", "hamstrings"], equipment: "barbell", focus: ["legs"], defaultMode: "barbell", glyph: "M5.4 21.8h7.2M19.2 21.8h7.4M8.4 21.8c1.6-6 13.6-6 15.2 0M16 12.4v3.6" },
  { id: "leg-curl", name: "腿弯举", muscles: ["hamstrings"], equipment: "machine", focus: ["legs"], defaultMode: "machine", glyph: "M6.4 19.8h13.2M18.4 19.8c3.4 0 5.2-5.2 1.8-7M8.4 14.4v9.2M22 12.4v3.2" },
  { id: "leg-ext", name: "腿屈伸", muscles: ["quads"], equipment: "machine", focus: ["legs"], defaultMode: "machine", glyph: "M7.4 18.4h11.2M19 18.4 24.2 13M9.4 12.4v9.2M24 10.4v3.2" },
  { id: "calf-raise", name: "站姿提踵", muscles: ["calves"], equipment: "machine", focus: ["legs"], defaultMode: "machine", glyph: "M12.4 25.8V14.4M19.6 25.8V14.4M8.4 25.8h15.2M14.2 10.4h3.6M16 6.6v3.8" },
  { id: "lunge", name: "箭步蹲", muscles: ["quads", "glutes"], equipment: "dumbbell", focus: ["legs"], defaultMode: "dumbbell", glyph: "M13.4 23.8V8.6M13.4 16.4 21 23.8M9.4 23.8h7.2M21.2 25.6h3.4M10.4 8.6h5.2" },
  { id: "ohp", name: "坐姿肩上推举", muscles: ["front-delt", "side-delt", "triceps"], equipment: "barbell", focus: ["shoulders"], defaultMode: "barbell", glyph: "M7.4 11.4h17.2M10.4 11.4v4.8h11.2v-4.8M16 16.2v7.2M12.2 25.6h7.6" },
  { id: "arnold", name: "阿诺德推举", muscles: ["front-delt", "side-delt"], equipment: "dumbbell", focus: ["shoulders"], defaultMode: "dumbbell", glyph: "M8.4 14.4c3.2-5 11.6-5 14.8 0M10.4 14.4v4.6M21.6 14.4v4.6M16 18v5.8" },
  { id: "lateral", name: "侧平举", muscles: ["side-delt"], equipment: "dumbbell", focus: ["shoulders"], defaultMode: "dumbbell", glyph: "M16 20.4V8.6M6.6 16.4h5.2M20.2 16.4h5.2M8.2 14.4v3.8M23.8 14.4v3.8" },
  { id: "front-raise", name: "前平举", muscles: ["front-delt"], equipment: "dumbbell", focus: ["shoulders"], defaultMode: "dumbbell", glyph: "M10.4 23.6c1.5-8.6 9.2-8.6 10.8 0M12.2 16.4h7.6M14.2 12.4h3.6" },
  { id: "rear-fly", name: "俯身飞鸟", muscles: ["rear-delt", "upper-back"], equipment: "dumbbell", focus: ["shoulders", "pull"], defaultMode: "dumbbell", glyph: "M16 21.8V12.4M7.6 14.4 13 18M24.4 14.4 19 18M8.2 12.4h3.4M20.4 12.4h3.4" },
  { id: "upright-row", name: "直立划船", muscles: ["side-delt", "traps"], equipment: "barbell", focus: ["shoulders", "pull"], defaultMode: "barbell", glyph: "M7.4 20.4h17.2M10.4 20.4V12.8M21.6 20.4V12.8M12.2 12.8h7.6M16 8.6v4.2" },
  { id: "shrug", name: "耸肩", muscles: ["traps"], equipment: "barbell", focus: ["shoulders", "pull"], defaultMode: "barbell", glyph: "M6.4 21.8h19.2M9.4 21.8v-3.6M22.6 21.8v-3.6M10.4 12.6c1.5-3.4 9.2-3.4 10.8 0M16 7.4v2.8" },
  { id: "run", name: "跑步", muscles: ["quads", "hamstrings", "calves"], equipment: "cardio", focus: ["cardio"], defaultMode: "bodyweight", glyph: "M11.4 8.2a1.6 1.6 0 1 0 .01 0M9.4 23.6l4.4-6.2 2.6 2.6 4.4-7M8.4 18l3.4 1.6M20 23.6h5.2" },
  { id: "rower", name: "划船机", muscles: ["lats", "quads", "upper-back"], equipment: "cardio", focus: ["cardio", "pull"], defaultMode: "machine", glyph: "M5.4 21.8h21.2M8.4 21.8V16.4h5.4l7.2-5.2M16 10.4v5.2M22 8.6v3.4" },
  { id: "bike", name: "单车", muscles: ["quads", "calves"], equipment: "cardio", focus: ["cardio"], defaultMode: "machine", glyph: "M9.4 21.8a3.4 3.4 0 1 0 .01 0M22.6 21.8a3.4 3.4 0 1 0 .01 0M9.4 21.8l5.4-7 4.4 5.2 2.6-5.2M14.2 10.4h5.2" },
  { id: "burpee", name: "波比", muscles: ["chest", "quads", "abs"], equipment: "bodyweight", focus: ["cardio"], defaultMode: "bodyweight", glyph: "M6.4 23.6h19.2M8.4 23.6l3.4-5.2h8.4l3.4 5.2M12.2 18.4V12.8h7.6v5.6M16 8.6v4" },
  { id: "jack", name: "开合跳", muscles: ["calves", "quads", "side-delt"], equipment: "bodyweight", focus: ["cardio"], defaultMode: "bodyweight", glyph: "M16 7.6v5.2M8.4 12.4 16 16l7.6-3.6M10.4 25.2 16 16.8l5.6 8.4" },
  { id: "mountain", name: "登山跑", muscles: ["abs", "quads", "front-delt"], equipment: "bodyweight", focus: ["cardio", "core"], defaultMode: "bodyweight", glyph: "M6.4 21.8 16 10.6 9.6 11.2M12.2 16.4 16 21.8M20 14.4l-2.6 7.2" },
  { id: "crunch", name: "卷腹", muscles: ["abs"], equipment: "bodyweight", focus: ["core"], defaultMode: "bodyweight", glyph: "M7.4 21.8c3.4-1.6 13.4-1.6 16.8 0M10.4 18c2.4-4.2 8-4.2 10.4 0M14.2 12.4h3.6" },
  { id: "hanging-leg", name: "悬垂举腿", muscles: ["abs", "forearm"], equipment: "bodyweight", focus: ["core"], defaultMode: "bodyweight", glyph: "M8.4 6.6h15.2M12.4 6.6v4.4M19.6 6.6v4.4M16 11v5.4M12.2 22.6 16 16.8l3.8 5.8" },
  { id: "plank", name: "平板支撑", muscles: ["abs", "front-delt", "obliques"], equipment: "bodyweight", focus: ["core"], defaultMode: "bodyweight", glyph: "M5.4 20.4h13.2l5.2-5.2M8.4 20.4v3.4M18.6 20.4v2.6M23.8 12.6v3.4" },
  { id: "russian", name: "俄罗斯转体", muscles: ["obliques", "abs"], equipment: "bodyweight", focus: ["core"], defaultMode: "bodyweight", glyph: "M8.4 20.4h15.2M16 20.4V12.8M10.4 14.4 16 16.2l5.4-3.4M7.6 23.6h5.2M19.2 23.6h5.2" },
]

export const builtinExercises: ExerciseDef[] = seeds.map((seed) => ({ ...seed, builtin: true }))

export function monogramGlyph(name: string) {
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const left = 10 + (hash % 3)
  const right = 22 - (hash % 3)
  return `M16 7.2 24.2 16 16 24.8 7.8 16Z M${left} 16h${right - left}`
}

export function getBuiltinExercise(id: string) {
  return builtinExercises.find((exercise) => exercise.id === id)
}

export function musclesOf(ids: string[]): MuscleId[] {
  const found = new Set<MuscleId>()
  ids.forEach((id) => getBuiltinExercise(id)?.muscles.forEach((muscle) => found.add(muscle)))
  return [...found]
}
