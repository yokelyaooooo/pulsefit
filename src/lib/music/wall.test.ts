import assert from "node:assert/strict"
import test from "node:test"
import { mergeCovers, rankCovers, type WallCover } from "./wall-data.ts"

function cover(partial: Partial<WallCover> & Pick<WallCover, "id">): WallCover {
  return {
    title: partial.title ?? partial.id,
    artist: partial.artist ?? "artist",
    artwork: partial.artwork ?? "https://example.com/a.jpg",
    source: partial.source ?? "apple",
    plays: partial.plays ?? 0,
    id: partial.id,
  }
}

test("merge keeps the higher play count and drops non-https art", () => {
  const merged = mergeCovers(
    [cover({ id: "a", plays: 4, title: "旧" })],
    [cover({ id: "a", plays: 1, title: "新" }), cover({ id: "b", artwork: "/local.jpg" }), cover({ id: "c", plays: 2 })]
  )
  assert.deepEqual(
    merged.map((item) => [item.id, item.plays, item.title]),
    [
      ["a", 4, "新"],
      ["c", 2, "c"],
    ]
  )
})

test("rank puts frequently played covers first", () => {
  const ranked = rankCovers([cover({ id: "low", plays: 1 }), cover({ id: "high", plays: 9 }), cover({ id: "mid", plays: 3 })])
  assert.deepEqual(
    ranked.map((item) => item.id),
    ["high", "mid", "low"]
  )
})
