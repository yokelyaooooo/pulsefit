import assert from "node:assert/strict"
import test from "node:test"
import { patternLaneKeys, patterns } from "./audio/patterns.ts"
import { formatClock, sixteenthIndex } from "./audio/clock.ts"
import { parseState } from "./storage.ts"
import { phaseAt, planDuration } from "./workout.ts"

test("hiit duration skips the rest after the last round", () => {
  const plan = { rounds: 8, workSec: 40, restSec: 20 }
  assert.equal(planDuration(plan), 460)
})

test("phase clock walks work then rest", () => {
  const plan = { rounds: 8, workSec: 40, restSec: 20 }
  assert.deepEqual(phaseAt(plan, 0), {
    round: 1,
    phase: "work",
    remaining: 40,
    elapsed: 0,
    total: 460,
    done: false,
  })
  const rest = phaseAt(plan, 40)
  assert.equal(rest.phase, "rest")
  assert.equal(rest.round, 1)
  assert.equal(rest.remaining, 20)
  const next = phaseAt(plan, 60)
  assert.equal(next.round, 2)
  assert.equal(next.phase, "work")
  assert.equal(phaseAt(plan, 460).done, true)
  assert.equal(phaseAt(plan, 999).elapsed, 460)
})

test("continuous plans have no rest phase", () => {
  const plan = { rounds: 1, workSec: 480, restSec: 0 }
  assert.equal(planDuration(plan), 480)
  assert.equal(phaseAt(plan, 120).phase, "work")
  assert.equal(phaseAt(plan, 120).remaining, 360)
})

test("sixteenth index follows bpm", () => {
  assert.equal(sixteenthIndex(0, 120), 0)
  assert.equal(sixteenthIndex(0.124, 120), 0)
  assert.equal(sixteenthIndex(0.125, 120), 1)
})

test("formatClock rolls minutes", () => {
  assert.equal(formatClock(0), "0:00")
  assert.equal(formatClock(65), "1:05")
  assert.equal(formatClock(-4), "0:00")
})

test("every pattern is sixteen steps", () => {
  for (const pattern of Object.values(patterns)) {
    for (const key of patternLaneKeys) {
      assert.equal(pattern[key].length, 16, `${pattern.id}.${key}`)
    }
  }
})

test("corrupt storage falls back", () => {
  assert.equal(parseState("not-json").volume, 0.8)
  assert.deepEqual(parseState(null).favorites, [])
  const parsed = parseState(
    JSON.stringify({
      favorites: ["tide", 3],
      volume: 2,
      sessions: [{ id: "x" }, { id: "ok", planId: "hiit", planName: "燃脂间歇", completedAt: "t", durationSec: 10, bpm: 160, finished: true }],
    })
  )
  assert.deepEqual(parsed.favorites, ["tide"])
  assert.equal(parsed.volume, 0.8)
  assert.equal(parsed.sessions.length, 1)
})
