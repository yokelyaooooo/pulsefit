import assert from "node:assert/strict"
import test from "node:test"
import { tracks } from "../catalog.ts"
import { getFocus } from "./focus.ts"
import { playlistFor, scoreTrack } from "./recommend.ts"

test("push day prefers nearby strength over fast cardio", () => {
  const push = getFocus("push")
  assert.ok(push)
  const library = tracks.map((track) => ({ id: track.id, tag: track.tag, bpm: track.bpm, energy: track.energy }))
  const ranked = playlistFor(push, library, undefined, 4)
  assert.equal(ranked[0], "iron-law")
  const iron = tracks.find((track) => track.id === "iron-law")
  const cruise = tracks.find((track) => track.id === "cruise")
  assert.ok(iron && cruise)
  assert.ok(scoreTrack(push, iron) > scoreTrack(push, cruise))
})

test("cardio day prefers cardio and hiit, pins replace the auto list", () => {
  const cardio = getFocus("cardio")
  assert.ok(cardio)
  const library = tracks.map((track) => ({ id: track.id, tag: track.tag, bpm: track.bpm, energy: track.energy }))
  const ranked = playlistFor(cardio, library, undefined, 3)
  assert.equal(ranked.includes("barbell"), false)
  assert.deepEqual(playlistFor(cardio, library, ["tide", "missing"]), ["tide"])
})
