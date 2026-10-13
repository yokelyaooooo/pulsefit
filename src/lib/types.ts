export type WorkoutTag = "hiit" | "strength" | "cardio" | "yoga" | "recover"

export interface Track {
  id: string
  title: string
  titleEn: string
  patternId: string
  bpm: number
  energy: number
  durationSec: number
  tag: WorkoutTag
  blurb: string
}

export interface WorkoutPlan {
  id: string
  name: string
  blurb: string
  tag: WorkoutTag
  bpm: number
  workSec: number
  restSec: number
  rounds: number
  energyWork: number
  energyRest: number
  trackId: string
}

export interface SessionRecord {
  id: string
  planId: string
  planName: string
  completedAt: string
  durationSec: number
  bpm: number
  finished: boolean
}

export interface WorkoutClock {
  planId: string
  elapsedSec: number
  running: boolean
  clockEpoch: number
}

export interface PhaseSnapshot {
  round: number
  phase: "work" | "rest"
  remaining: number
  elapsed: number
  total: number
  done: boolean
}

export interface PersistedState {
  favorites: string[]
  sessions: SessionRecord[]
  volume: number
}
