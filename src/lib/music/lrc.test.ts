import assert from "node:assert/strict"
import test from "node:test"
import { lyricIndexAt, parseLrc } from "./lrc.ts"

test("parses lrc stamps and sorts shared lines", () => {
  const lines = parseLrc("[00:01.20]第一句\n[00:05.00][00:09]第二处\n不是歌词")
  assert.deepEqual(
    lines.map((line) => [line.time, line.text]),
    [
      [1.2, "第一句"],
      [5, "第二处"],
      [9, "第二处"],
    ]
  )
  assert.equal(lyricIndexAt(lines, 0), -1)
  assert.equal(lyricIndexAt(lines, 5), 1)
  assert.equal(lyricIndexAt(lines, 9.2), 2)
})
