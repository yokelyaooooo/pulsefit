import { createJsonStore } from "@/lib/json-store"
import { emptyWall, mergeCovers, parseWall, type WallCover } from "@/lib/music/wall-data"

export type { WallCover } from "@/lib/music/wall-data"
export { mergeCovers, parseWall, rankCovers } from "@/lib/music/wall-data"

const store = createJsonStore("pulsefit.wall.v1", parseWall, emptyWall)

export const subscribeWall = store.subscribe
export const getWallSnapshot = store.getSnapshot
export const getServerWallSnapshot = store.getServerSnapshot
export const hydrateWall = store.hydrate

export function rememberImported(incoming: Array<Omit<WallCover, "plays"> & { plays?: number }>) {
  const next = incoming.flatMap((cover) => {
    if (!cover.artwork.startsWith("https://")) return []
    return [{ ...cover, plays: cover.plays ?? 0 }]
  })
  if (next.length === 0) return
  store.update({ imported: mergeCovers(store.getSnapshot().imported, next) })
}

export function notePlay(id: string) {
  const imported = store.getSnapshot().imported
  if (!imported.some((cover) => cover.id === id)) return
  store.update({
    imported: imported.map((cover) => (cover.id === id ? { ...cover, plays: cover.plays + 1 } : cover)),
  })
}
