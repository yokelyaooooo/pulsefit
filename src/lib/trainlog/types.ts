export const MUSCLES = [
  ["chest", "胸"],
  ["front-delt", "三角前束"],
  ["side-delt", "三角中束"],
  ["rear-delt", "三角后束"],
  ["biceps", "肱二头"],
  ["triceps", "肱三头"],
  ["forearm", "前臂"],
  ["abs", "腹直肌"],
  ["obliques", "腹斜肌"],
  ["quads", "股四头"],
  ["hamstrings", "腘绳"],
  ["glutes", "臀"],
  ["calves", "小腿"],
  ["traps", "斜方"],
  ["lats", "背阔"],
  ["upper-back", "上背"],
  ["lower-back", "下背"],
] as const

export type MuscleId = (typeof MUSCLES)[number][0]

export const muscleLabel: Record<MuscleId, string> = Object.fromEntries(MUSCLES) as Record<MuscleId, string>

export type Equipment = "barbell" | "dumbbell" | "cable" | "machine" | "bodyweight" | "cardio"
export type LoadMode = "barbell" | "dumbbell" | "bodyweight" | "machine"
export type SetKind = "work" | "warmup" | "cardio"
export type TrainFocus = "push" | "pull" | "legs" | "shoulders" | "cardio" | "core"

export interface ExerciseDef {
  id: string
  name: string
  muscles: MuscleId[]
  equipment: Equipment
  focus: TrainFocus[]
  defaultMode: LoadMode
  glyph: string
  builtin: boolean
}

export interface PlanDef {
  id: string
  name: string
  focus: TrainFocus
  blurb: string
  exerciseIds: string[]
  builtin: boolean
}

export interface SetEntry {
  id: string
  kind: SetKind
  mode: LoadMode
  kg: number
  kgRight: number | null
  reps: number
  seconds: number
  label: string
}

export interface LoggedExercise {
  id: string
  exerciseId: string
  name: string
  sets: SetEntry[]
}

export interface WorkoutLog {
  id: string
  date: string
  title: string
  planId: string | null
  focusId: string | null
  startedAt: string
  endedAt: string | null
  durationSec: number
  exercises: LoggedExercise[]
}

export interface TrainState {
  logs: WorkoutLog[]
  customExercises: ExerciseDef[]
  customPlans: PlanDef[]
}
