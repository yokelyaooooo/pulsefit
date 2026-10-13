import { readItunesTopAlbums } from "@/lib/music/charts"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const FEED = "https://itunes.apple.com/us/rss/topalbums/limit=24/json"

export async function GET() {
  try {
    const response = await fetch(FEED, {
      headers: { accept: "application/json", "user-agent": "PulseFit/1.0" },
      next: { revalidate: 60 * 60 },
    })
    if (!response.ok) {
      return NextResponse.json({ albums: [], error: "榜单暂时取不到。" }, { status: 502 })
    }
    return NextResponse.json({
      source: "itunes-rss-topalbums",
      albums: readItunesTopAlbums(await response.json()),
    })
  } catch {
    return NextResponse.json({ albums: [], error: "榜单暂时取不到。" }, { status: 502 })
  }
}
