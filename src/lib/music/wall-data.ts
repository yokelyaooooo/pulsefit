export interface WallCover {
  id: string
  title: string
  artist: string
  artwork: string
  source: string
  plays: number
}

export interface WallState {
  imported: WallCover[]
}

export const emptyWall: WallState = { imported: [] }

function isCover(value: unknown): value is WallCover {
  if (!value || typeof value !== "object") return false
  const row = value as WallCover
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    typeof row.artist === "string" &&
    typeof row.artwork === "string" &&
    row.artwork.startsWith("https://") &&
    typeof row.source === "string" &&
    typeof row.plays === "number"
  )
}

export function parseWall(raw: string | null): WallState {
  if (!raw) return emptyWall
  try {
    const data = JSON.parse(raw) as { imported?: unknown }
    const imported = Array.isArray(data.imported) ? data.imported.filter(isCover).slice(0, 48) : []
    return { imported }
  } catch {
    return emptyWall
  }
}

export function mergeCovers(current: WallCover[], incoming: WallCover[]) {
  const byId = new Map(current.map((cover) => [cover.id, cover]))
  for (const cover of incoming) {
    if (!cover.artwork.startsWith("https://")) continue
    const prev = byId.get(cover.id)
    byId.set(cover.id, {
      ...cover,
      plays: Math.max(prev?.plays ?? 0, cover.plays),
      title: cover.title || prev?.title || "未命名",
      artist: cover.artist || prev?.artist || "",
    })
  }
  return [...byId.values()].slice(0, 48)
}

export function rankCovers(covers: WallCover[]) {
  return [...covers].sort((left, right) => right.plays - left.plays || left.title.localeCompare(right.title))
}
