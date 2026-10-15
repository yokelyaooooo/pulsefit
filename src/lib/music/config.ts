import { createJsonStore } from "@/lib/json-store"
import type { MusicSettings } from "@/lib/music/types"

export const MUSIC_KEY = "pulsefit.music.v1"

function envOr(value: string | undefined, fallback: string) {
  return value && value.trim() ? value.trim() : fallback
}

export function defaultMusicSettings(): MusicSettings {
  return {
    neteaseBase: envOr(process.env.NEXT_PUBLIC_NETEASE_API, "/api/netease"),
    qqBase: envOr(process.env.NEXT_PUBLIC_QQ_API, "/api/qq"),
    appleToken: envOr(process.env.NEXT_PUBLIC_APPLE_MUSIC_TOKEN, ""),
    neteaseCookie: "",
    neteaseUid: "",
    neteaseName: "",
    qqCookie: "",
    qqUin: "",
    qqName: "",
  }
}

const serverMusic = defaultMusicSettings()

export function parseMusicSettings(raw: string | null): MusicSettings {
  if (!raw) return serverMusic
  try {
    const data = JSON.parse(raw) as Partial<MusicSettings>
    const base = defaultMusicSettings()
    const pick = (value: unknown, fallback: string) => (typeof value === "string" ? value : fallback)
    return {
      neteaseBase: !data.neteaseCookie && data.neteaseBase === "http://127.0.0.1:3000" ? base.neteaseBase : pick(data.neteaseBase, base.neteaseBase) || base.neteaseBase,
      qqBase: !data.qqCookie && data.qqBase === "http://127.0.0.1:3300" ? base.qqBase : pick(data.qqBase, base.qqBase) || base.qqBase,
      appleToken: pick(data.appleToken, base.appleToken),
      neteaseCookie: pick(data.neteaseCookie, ""),
      neteaseUid: pick(data.neteaseUid, ""),
      neteaseName: pick(data.neteaseName, ""),
      qqCookie: pick(data.qqCookie, ""),
      qqUin: pick(data.qqUin, ""),
      qqName: pick(data.qqName, ""),
    }
  } catch {
    return serverMusic
  }
}

const musicStore = createJsonStore(MUSIC_KEY, parseMusicSettings, serverMusic)

export const subscribeMusic = musicStore.subscribe
export const getMusicSnapshot = musicStore.getSnapshot
export const getServerMusicSnapshot = musicStore.getServerSnapshot
export const hydrateMusic = musicStore.hydrate
export const updateMusic = musicStore.update
