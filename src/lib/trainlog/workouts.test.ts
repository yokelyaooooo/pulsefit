import assert from "node:assert/strict"
import test from "node:test"
import { completedSets, createEntry, finishWorkout, previousExercise, repeatWorkout } from "./workouts.ts"
import { activeMuscles, logVolumeKg } from "./stats.ts"
import type { ExerciseDef, WorkoutLog } from "./types.ts"

const exercise: ExerciseDef = { id: "press", name: "哑铃推举", equipment: "dumbbell", defaultMode: "dumbbell", muscles: ["front-delt"], focus: ["shoulders"], glyph: "press", builtin: true }
function fixture(): WorkoutLog {
  return { id: "before", date: "2026-10-13", title: "肩日", planId: null, focusId: "shoulders", startedAt: "2026-10-13T08:00:00Z", endedAt: null, durationSec: 0, notes: "上次的感受", exercises: [{ id: "exercise", exerciseId: exercise.id, name: exercise.name, sets: [
    { id: "warm", kind: "warmup", mode: "dumbbell", kg: 5, kgRight: 5, reps: 10, seconds: 0, label: "", completed: true },
    { id: "work", kind: "work", mode: "dumbbell", kg: 15, kgRight: 17.5, reps: 10, seconds: 0, label: "", completed: true },
    { id: "drop", kind: "drop", mode: "dumbbell", kg: 10, kgRight: 10, reps: 8, seconds: 0, label: "", completed: true },
    { id: "unchecked", kind: "work", mode: "dumbbell", kg: 25, kgRight: 25, reps: 10, seconds: 0, label: "", completed: false },
  ] }] }
}

test("finish saves only completed sets and calculates both dumbbells and drop sets", () => {
  const log = fixture()
  assert.equal(logVolumeKg(log), 485)
  const finished = finishWorkout(log, new Date("2026-10-13T08:48:00Z"))
  assert.equal(finished.durationSec, 2880)
  assert.equal(completedSets(finished), 3)
  assert.equal(finished.exercises[0].sets.length, 3)
  assert.equal(log.exercises[0].sets.length, 4)
  assert.deepEqual(activeMuscles(finished, () => exercise), ["front-delt"])
})

test("legacy records without completed flags retain their volume", () => {
  const log = fixture()
  log.exercises[0].sets.forEach((set) => { delete set.completed })
  assert.equal(logVolumeKg(log), 985)
  assert.equal(completedSets(log), 4)
})

test("repeat and previous performance carry weights while resetting completion and rest", () => {
  const finished = finishWorkout(fixture(), new Date("2026-10-13T08:48:00Z"))
  const repeated = repeatWorkout(finished, new Date("2026-10-14T08:00:00Z"))
  assert.notEqual(repeated.id, finished.id)
  assert.equal(repeated.endedAt, null)
  assert.equal(repeated.restEndsAt, null)
  assert.equal(repeated.notes, "")
  assert.equal(completedSets(repeated), 0)
  assert.equal(logVolumeKg(repeated), 0)
  assert.equal(previousExercise([repeated, finished], exercise.id)?.sets[1].kgRight, 17.5)
  const entry = createEntry(exercise, [finished])
  assert.equal(entry.sets[1].kgRight, 17.5)
  assert.ok(entry.sets.every((set) => set.completed === false))
  assert.notEqual(entry.sets[0].id, finished.exercises[0].sets[0].id)
})
