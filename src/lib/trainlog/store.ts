import { createJsonStore } from "@/lib/json-store"
import { builtinExercises } from "@/lib/trainlog/exercises"
import { builtinPlans } from "@/lib/trainlog/plans"
import type { ExerciseDef, PlanDef, TrainState, WorkoutLog } from "@/lib/trainlog/types"

export const TRAIN_KEY = "pulsefit.train.v1"

export function emptyTrainState(): TrainState {
  return { logs: [], customExercises: [], customPlans: [] }
}

function isExercise(value: unknown): value is ExerciseDef {
  if (!value || typeof value !== "object") return false
  const row = value as ExerciseDef
  return typeof row.id === "string" && typeof row.name === "string" && Array.isArray(row.muscles) && typeof row.glyph === "string"
}

function isPlan(value: unknown): value is PlanDef {
  if (!value || typeof value !== "object") return false
  const row = value as PlanDef
  return typeof row.id === "string" && typeof row.name === "string" && Array.isArray(row.exerciseIds)
}

function isLog(value: unknown): value is WorkoutLog {
  if (!value || typeof value !== "object") return false
  const row = value as WorkoutLog
  return typeof row.id === "string" && typeof row.date === "string" && Array.isArray(row.exercises)
}

const serverTrain = emptyTrainState()

export function parseTrainState(raw: string | null): TrainState {
  if (!raw) return serverTrain
  try {
    const data = JSON.parse(raw) as Partial<TrainState>
    return {
      logs: Array.isArray(data.logs) ? data.logs.filter(isLog) : [],
      customExercises: Array.isArray(data.customExercises) ? data.customExercises.filter(isExercise) : [],
      customPlans: Array.isArray(data.customPlans) ? data.customPlans.filter(isPlan) : [],
    }
  } catch {
    return emptyTrainState()
  }
}

const trainStore = createJsonStore(TRAIN_KEY, parseTrainState, serverTrain)

export const subscribeTrain = trainStore.subscribe
export const getTrainSnapshot = trainStore.getSnapshot
export const getServerTrainSnapshot = trainStore.getServerSnapshot
export const hydrateTrain = trainStore.hydrate
export const updateTrain = trainStore.update

export function allExercises(state: TrainState) {
  return [...builtinExercises, ...state.customExercises]
}

export function allPlans(state: TrainState) {
  return [...builtinPlans, ...state.customPlans]
}

export function findExercise(state: TrainState, id: string) {
  return allExercises(state).find((exercise) => exercise.id === id)
}

export function findPlan(state: TrainState, id: string) {
  return allPlans(state).find((plan) => plan.id === id)
}
