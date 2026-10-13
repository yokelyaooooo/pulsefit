export interface ChartAlbum {
  title: string
  artist: string
  artwork: string
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null
}

function label(value: unknown) {
  const row = asRecord(value)
  return typeof row?.label === "string" ? row.label : ""
}

function sizedArtwork(url: string) {
  if (!url.startsWith("https://") || !url.includes(".mzstatic.com/")) return null
  return url.replace(/\/\d+x\d+bb\.(jpg|png|webp)$/i, "/300x300bb.$1")
}

export function readItunesTopAlbums(payload: unknown): ChartAlbum[] {
  const feed = asRecord(asRecord(payload)?.feed)
  const entry = feed?.entry
  const rows = Array.isArray(entry) ? entry : entry ? [entry] : []
  const albums: ChartAlbum[] = []
  for (const row of rows) {
    const item = asRecord(row)
    if (!item) continue
    const images = Array.isArray(item["im:image"]) ? item["im:image"] : []
    const last = asRecord(images[images.length - 1])
    const artwork = typeof last?.label === "string" ? sizedArtwork(last.label) : null
    const title = label(item["im:name"])
    const artist = label(item["im:artist"])
    if (!artwork || !title) continue
    albums.push({ title, artist: artist || "iTunes", artwork })
  }
  return albums
}
