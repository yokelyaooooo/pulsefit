import type { ExerciseDef, LoggedExercise, SetEntry, SetKind, WorkoutLog } from "./types"

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function makeSet(exercise: ExerciseDef, kind: SetKind = "work", previous?: SetEntry): SetEntry {
  return {
    id: newId(), kind, mode: exercise.defaultMode, kg: previous?.kg ?? 0,
    kgRight: exercise.defaultMode === "dumbbell" ? previous?.kgRight ?? previous?.kg ?? 0 : null,
    reps: kind === "cardio" ? 0 : previous?.reps ?? 10,
    seconds: kind === "cardio" ? previous?.seconds || 60 : 0,
    label: kind === "cardio" ? exercise.equipment === "cardio" ? exercise.name : "组间有氧" : "", completed: false,
  }
}

export function previousExercise(logs: WorkoutLog[], exerciseId: string, exceptId?: string): LoggedExercise | undefined {
  return [...logs].filter((log) => log.endedAt && log.id !== exceptId)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.endedAt ?? "").localeCompare(a.endedAt ?? ""))
    .flatMap((log) => log.exercises).find((entry) => entry.exerciseId === exerciseId)
}

export function createEntry(exercise: ExerciseDef, logs: WorkoutLog[] = []): LoggedExercise {
  const previous = previousExercise(logs, exercise.id)
  const oldSets = previous?.sets.filter((set) => set.completed !== false)
  return {
    id: newId(), exerciseId: exercise.id, name: exercise.name,
    sets: oldSets?.length ? oldSets.map((set) => ({ ...set, id: newId(), completed: false }))
      : Array.from({ length: exercise.equipment === "cardio" ? 1 : 3 }, () => makeSet(exercise, exercise.equipment === "cardio" ? "cardio" : "work")),
  }
}

export function repeatWorkout(log: WorkoutLog, now = new Date()): WorkoutLog {
  return { ...log, id: newId(), date: localDay(now), startedAt: now.toISOString(), endedAt: null, durationSec: 0,
    restEndsAt: null, notes: "", exercises: log.exercises.map((entry) => ({ ...entry, id: newId(),
      sets: entry.sets.map((set) => ({ ...set, id: newId(), completed: false })),
    })),
  }
}

export function completedSets(log: WorkoutLog) {
  return log.exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.completed !== false).length, 0)
}

export function finishWorkout(log: WorkoutLog, now = new Date()): WorkoutLog {
  return { ...log, endedAt: now.toISOString(), durationSec: Math.max(1, Math.round((now.getTime() - Date.parse(log.startedAt)) / 1000)), restEndsAt: null,
    exercises: log.exercises.map((entry) => ({ ...entry, sets: entry.sets.filter((set) => set.completed !== false) })).filter((entry) => entry.sets.length),
  }
}

export function clockLabel(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safe / 3600)
  return `${hours ? `${hours}:` : ""}${String(Math.floor(safe / 60) % 60).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`
}
