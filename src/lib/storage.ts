import type { PersistedState, SessionRecord } from "@/lib/types"

export const STORAGE_KEY = "pulsefit.v1"

export const emptyState = (): PersistedState => ({
  favorites: [],
  sessions: [],
  volume: 0.8,
})

function isRecord(value: unknown): value is SessionRecord {
  if (!value || typeof value !== "object") return false
  const record = value as SessionRecord
  return (
    typeof record.id === "string" &&
    typeof record.planId === "string" &&
    typeof record.planName === "string" &&
    typeof record.completedAt === "string" &&
    typeof record.durationSec === "number" &&
    typeof record.bpm === "number" &&
    typeof record.finished === "boolean"
  )
}

export function parseState(raw: string | null): PersistedState {
  if (!raw) return emptyState()
  try {
    const data = JSON.parse(raw) as Partial<PersistedState>
    return {
      favorites: Array.isArray(data.favorites)
        ? data.favorites.filter((id) => typeof id === "string")
        : [],
      sessions: Array.isArray(data.sessions) ? data.sessions.filter(isRecord) : [],
      volume:
        typeof data.volume === "number" && data.volume >= 0 && data.volume <= 1
          ? data.volume
          : 0.8,
    }
  } catch {
    return emptyState()
  }
}

export function loadState(): PersistedState {
  if (typeof window === "undefined") return emptyState()
  try {
    return parseState(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return emptyState()
  }
}

export function saveState(state: PersistedState) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Private mode and full storage both fall back to in-memory state.
  }
}

const serverSnapshot: PersistedState = emptyState()
let snapshot: PersistedState = serverSnapshot
let loaded = false
const listeners = new Set<() => void>()

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return
  snapshot = loadState()
  loaded = true
}

export function subscribePersisted(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPersistedSnapshot() {
  ensureLoaded()
  return snapshot
}

export function getServerPersistedSnapshot() {
  return serverSnapshot
}

export function updatePersisted(patch: Partial<PersistedState>) {
  ensureLoaded()
  snapshot = { ...snapshot, ...patch }
  saveState(snapshot)
  listeners.forEach((listener) => listener())
}
