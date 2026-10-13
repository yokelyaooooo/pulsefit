import assert from "node:assert/strict"
import test from "node:test"
import { builtinExercises } from "./exercises.ts"
import { estimateKcal, formatLoad, logVolumeKg, setVolumeKg, shareCardSvg } from "./stats.ts"
import type { SetEntry, WorkoutLog } from "./types.ts"

function set(partial: Partial<SetEntry>): SetEntry {
  return {
    id: "s",
    kind: "work",
    mode: "barbell",
    kg: 0,
    kgRight: null,
    reps: 0,
    seconds: 0,
    label: "",
    ...partial,
  }
}

test("volume counts work sets and dumbbell both sides", () => {
  assert.equal(setVolumeKg(set({ mode: "dumbbell", kg: 20, kgRight: 22, reps: 8 })), 336)
  assert.equal(setVolumeKg(set({ kind: "warmup", kg: 60, reps: 10 })), 0)
  assert.equal(setVolumeKg(set({ kind: "cardio", seconds: 90, label: "划船机" })), 0)
  const log: WorkoutLog = {
    id: "1",
    date: "2026-10-13",
    title: "推日",
    planId: null,
    focusId: "push",
    startedAt: "2026-10-13T08:00:00.000Z",
    endedAt: null,
    durationSec: 1800,
    exercises: [
      {
        id: "e",
        exerciseId: "bench-barbell",
        name: "平板卧推",
        sets: [set({ id: "w", kind: "warmup", kg: 40, reps: 12 }), set({ id: "a", kg: 80, reps: 5 })],
      },
    ],
  }
  assert.equal(logVolumeKg(log), 400)
  assert.equal(formatLoad(set({ mode: "dumbbell", kg: 12, kgRight: 12, reps: 10 })), "(12+12)kg × 10")
  assert.equal(estimateKcal(400, 60, 1800), Math.round(400 * 0.004 + 60 * 0.12 + 30 * 3.2))
})

test("builtin exercises each have a distinct icon", () => {
  assert.ok(builtinExercises.length >= 48)
  const ids = new Set(builtinExercises.map((exercise) => exercise.id))
  const glyphs = new Set(builtinExercises.map((exercise) => exercise.glyph))
  const names = new Set(builtinExercises.map((exercise) => exercise.name))
  assert.equal(ids.size, builtinExercises.length)
  assert.equal(glyphs.size, builtinExercises.length)
  assert.equal(names.size, builtinExercises.length)
  const card = shareCardSvg({
    title: "推日 <A&B>",
    date: "2026-10-13",
    volumeKg: 400,
    kcal: 110,
    durationSec: 1800,
    muscles: ["胸"],
  })
  assert.equal(card.includes("推日 &lt;A&amp;B&gt;"), true)
  assert.equal(card.includes("400 kg"), true)
})
