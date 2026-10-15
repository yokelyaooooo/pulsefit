import assert from "node:assert/strict"
import test from "node:test"
import { nextQueueId, shuffleQueue } from "./queue.ts"

test("repeat-one repeats only on automatic completion; next still skips", () => {
  assert.equal(nextQueueId(["a", "b"], "a", "one", true), "a")
  assert.equal(nextQueueId(["a", "b"], "a", "one"), "b")
  assert.equal(nextQueueId(["a", "b"], "b", "off", true), null)
  assert.equal(nextQueueId(["a", "b"], "b", "all", true), "a")
  assert.equal(nextQueueId([], "a", "all"), null)
})

test("shuffle preserves the current song and every queued item", () => {
  const original = ["a", "b", "c", "d"]
  const shuffled = shuffleQueue(original, "c", () => 0)
  assert.equal(shuffled[0], "c")
  assert.deepEqual([...shuffled].sort(), original)
  assert.deepEqual(original, ["a", "b", "c", "d"])
})
