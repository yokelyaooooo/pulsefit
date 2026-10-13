import assert from "node:assert/strict"
import test from "node:test"
import { isAllowedMusicBase } from "./allow.ts"

test("music bases stay on localhost http or public https", () => {
  assert.equal(isAllowedMusicBase("http://127.0.0.1:3000"), true)
  assert.equal(isAllowedMusicBase("http://localhost:3300"), true)
  assert.equal(isAllowedMusicBase("https://music.example.com"), true)
  assert.equal(isAllowedMusicBase("http://192.168.1.8:3000"), false)
  assert.equal(isAllowedMusicBase("https://169.254.169.254"), false)
  assert.equal(isAllowedMusicBase("http://metadata.google.internal"), false)
  assert.equal(isAllowedMusicBase("file:///etc/passwd"), false)
  assert.equal(isAllowedMusicBase("https://user:pass@example.com"), false)
})
