import assert from "node:assert/strict"
import test from "node:test"
import {
  qqUinFromCookie,
  readNeteaseSongs,
  readNeteaseUrl,
  readQrCheck,
  readQqLyric,
  readQqSongs,
  readQqUrls,
} from "./parse.ts"

test("netease songs and preview urls", () => {
  const songs = readNeteaseSongs({
    songs: [{ id: 9, name: "夜跑", dt: 180000, ar: [{ name: "燃律" }], al: { name: "Pulse", picUrl: "https://img" } }],
  })
  assert.equal(songs[0]?.id, "netease:9")
  assert.equal(songs[0]?.artist, "燃律")
  assert.equal(songs[0]?.durationSec, 180)
  assert.deepEqual(readNeteaseUrl({ data: [{ id: 9, url: "https://audio", freeTrialInfo: { end: 30 } }] }, "9"), {
    url: "https://audio",
    previewOnly: true,
  })
  assert.equal(readQrCheck({ code: 803, cookie: "MUSIC_U=1", message: "" }).cookie, "MUSIC_U=1")
})

test("qq songs, cookie uin and urls", () => {
  const songs = readQqSongs({ data: { song: { list: [{ songmid: "abc", songname: "铁律", singer: [{ name: "A" }], interval: 200, albummid: "alb" }] } } })
  assert.equal(songs[0]?.id, "qq:abc")
  assert.equal(songs[0]?.artwork?.includes("alb"), true)
  assert.equal(qqUinFromCookie("uin=o12345; qm_keyst=secret"), "12345")
  assert.deepEqual(readQqUrls({ data: { abc: "https://qq.audio/a.m4a" } }), { abc: "https://qq.audio/a.m4a" })
  assert.equal(readQqLyric({ data: { lyric: "[00:01.00]一句" } }), "[00:01.00]一句")
})
