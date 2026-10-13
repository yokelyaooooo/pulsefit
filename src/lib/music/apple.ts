import { readApplePlaylistTracks, readApplePlaylists, readAppleSongs } from "@/lib/music/parse"
import type { CatalogItem, PlaylistItem } from "@/lib/music/types"

interface AppleArtwork {
  url?: string
}

interface AppleSongAttributes {
  name?: string
  artistName?: string
  albumName?: string
  durationInMillis?: number
  artwork?: AppleArtwork
}

interface AppleResource {
  id?: string
  attributes?: AppleSongAttributes
}

interface AppleInstance {
  authorize: () => Promise<string>
  unauthorize: () => Promise<void>
  isAuthorized: boolean
  storefrontId?: string
  setQueue: (options: { song?: string; songs?: string[] }) => Promise<void>
  play: () => Promise<void>
  pause: () => Promise<void>
  stop: () => Promise<void>
  player: {
    currentPlaybackTime: number
    currentPlaybackDuration: number
    playbackState: number
    seekToTime: (seconds: number) => Promise<void>
  }
  api: {
    music: (path: string, query?: Record<string, string | string[]>) => Promise<unknown>
  }
}

declare global {
  interface Window {
    MusicKit?: {
      configure: (config: unknown) => Promise<void>
      getInstance: () => AppleInstance
    }
  }
}

let configuredToken = ""
let loading: Promise<void> | null = null

export function appleConfigured() {
  return configuredToken.length > 0
}

export function loadMusicKit() {
  if (typeof window === "undefined") return Promise.reject(new Error("MusicKit 只能在浏览器里加载。"))
  if (window.MusicKit) return Promise.resolve()
  if (loading) return loading
  loading = new Promise<void>((resolve, reject) => {
    const done = () => {
      if (window.MusicKit) resolve()
      else reject(new Error("MusicKit 已加载，但没有暴露接口。"))
    }
    document.addEventListener("musickitloaded", done, { once: true })
    const script = document.createElement("script")
    script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js"
    script.async = true
    script.dataset.musickit = "true"
    script.addEventListener("error", () => reject(new Error("MusicKit 脚本没有加载。需要能访问 Apple 的 CDN。")))
    document.head.appendChild(script)
  })
  return loading
}

export async function configureApple(token: string) {
  const trimmed = token.trim()
  if (!trimmed) throw new Error("还没有填写 Apple developer token。")
  await loadMusicKit()
  if (!window.MusicKit) throw new Error("MusicKit 不可用。")
  if (configuredToken !== trimmed) {
    await window.MusicKit.configure({
      developerToken: trimmed,
      app: { name: "燃律 PulseFit", build: "1.0.0" },
    })
    configuredToken = trimmed
  }
  return window.MusicKit.getInstance()
}

export async function appleAuthorize(token: string) {
  const music = await configureApple(token)
  await music.authorize()
  return music.isAuthorized
}

export async function appleSearch(token: string, term: string): Promise<CatalogItem[]> {
  const music = await configureApple(token)
  const storefront = music.storefrontId || "cn"
  try {
    const payload = await music.api.music(`/v1/catalog/${storefront}/search`, {
      term,
      types: ["songs"],
      limit: "20",
    })
    const songs = readAppleSongs(payload)
    if (songs.length || storefront === "us") return songs
  } catch {
    // Fall through to the US storefront when the preferred one rejects the query.
  }
  const fallback = await music.api.music("/v1/catalog/us/search", { term, types: ["songs"], limit: "20" })
  return readAppleSongs(fallback)
}

export async function appleLibrary(token: string): Promise<PlaylistItem[]> {
  const music = await configureApple(token)
  if (!music.isAuthorized) throw new Error("先完成 Apple Music 授权，才能同步资料库。")
  const payload = await music.api.music("/v1/me/library/playlists", { limit: "25" })
  return readApplePlaylists(payload)
}

export async function applePlaylistTracks(token: string, playlistId: string): Promise<CatalogItem[]> {
  const music = await configureApple(token)
  const payload = await music.api.music(`/v1/me/library/playlists/${playlistId}/tracks`, { limit: "50" })
  return readApplePlaylistTracks(payload)
}

export async function applePlay(token: string, nativeId: string) {
  const music = await configureApple(token)
  if (!music.isAuthorized) await music.authorize()
  await music.setQueue({ song: nativeId })
  await music.play()
}

export function appleTransport() {
  if (typeof window === "undefined" || !window.MusicKit || !configuredToken) {
    return { position: 0, duration: 0, playing: false }
  }
  try {
    const player = window.MusicKit.getInstance().player
    return {
      position: player.currentPlaybackTime || 0,
      duration: player.currentPlaybackDuration || 0,
      playing: player.playbackState === 2,
    }
  } catch {
    return { position: 0, duration: 0, playing: false }
  }
}

export async function applePause() {
  if (!window.MusicKit || !configuredToken) return
  try {
    await window.MusicKit.getInstance().pause()
  } catch {
    // Already stopped.
  }
}

export async function appleResume() {
  if (!window.MusicKit || !configuredToken) return
  await window.MusicKit.getInstance().play()
}

export async function appleSeek(seconds: number) {
  if (!window.MusicKit || !configuredToken) return
  await window.MusicKit.getInstance().player.seekToTime(seconds)
}
