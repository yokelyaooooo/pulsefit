import assert from "node:assert/strict"
import test from "node:test"
import { readItunesTopAlbums } from "./charts.ts"

test("reads iTunes top album artwork and ignores other hosts", () => {
  const albums = readItunesTopAlbums({
    feed: {
      entry: [
        {
          "im:name": { label: "Night Drive" },
          "im:artist": { label: "Example" },
          "im:image": [{ label: "https://is1-ssl.mzstatic.com/image/thumb/a.jpg/55x55bb.jpg" }, { label: "https://is1-ssl.mzstatic.com/image/thumb/a.jpg/170x170bb.jpg" }],
        },
        {
          "im:name": { label: "Skip" },
          "im:artist": { label: "No" },
          "im:image": [{ label: "https://evil.example/a.jpg/170x170bb.jpg" }],
        },
      ],
    },
  })
  assert.equal(albums.length, 1)
  assert.equal(albums[0]?.title, "Night Drive")
  assert.equal(albums[0]?.artwork, "https://is1-ssl.mzstatic.com/image/thumb/a.jpg/300x300bb.jpg")
})
