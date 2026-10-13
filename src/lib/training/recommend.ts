import type { WorkoutTag } from "@/lib/types"
import type { TrainingFocus } from "@/lib/training/focus"

export interface Recommendable {
  id: string
  tag: WorkoutTag
  bpm: number
  energy: number
}

export function scoreTrack(focus: TrainingFocus, track: Recommendable) {
  const tagScore = focus.tags.includes(track.tag) ? 50 : 0
  const bpmScore = Math.max(0, 30 - Math.abs(track.bpm - focus.targetBpm) * 0.45)
  const energyScore = Math.max(0, 20 - Math.abs(track.energy - focus.intensity) * 40)
  return tagScore + bpmScore + energyScore
}

export function recommendIds(focus: TrainingFocus, library: Recommendable[], limit = 8) {
  return [...library]
    .sort((left, right) => scoreTrack(focus, right) - scoreTrack(focus, left) || left.bpm - right.bpm)
    .slice(0, limit)
    .map((track) => track.id)
}

export function playlistFor(focus: TrainingFocus, library: Recommendable[], pinned: string[] | undefined, limit = 8) {
  if (!pinned) return recommendIds(focus, library, limit)
  const known = new Set(library.map((track) => track.id))
  return pinned.filter((id) => known.has(id))
}
