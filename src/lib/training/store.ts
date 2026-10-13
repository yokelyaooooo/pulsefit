import { createJsonStore } from "@/lib/json-store"
import type { FocusId } from "@/lib/training/focus"

export const FOCUS_KEY = "pulsefit.focus.v1"

export interface FocusState {
  pins: Partial<Record<FocusId, string[]>>
}

export function emptyFocusState(): FocusState {
  return { pins: {} }
}

const serverFocus = emptyFocusState()

export function parseFocusState(raw: string | null): FocusState {
  if (!raw) return serverFocus
  try {
    const data = JSON.parse(raw) as { pins?: unknown }
    if (!data.pins || typeof data.pins !== "object" || Array.isArray(data.pins)) return emptyFocusState()
    const pins: FocusState["pins"] = {}
    for (const [key, value] of Object.entries(data.pins)) {
      if (!Array.isArray(value)) continue
      pins[key as FocusId] = value.filter((id) => typeof id === "string")
    }
    return { pins }
  } catch {
    return emptyFocusState()
  }
}

const focusStore = createJsonStore(FOCUS_KEY, parseFocusState, serverFocus)

export const subscribeFocus = focusStore.subscribe
export const getFocusSnapshot = focusStore.getSnapshot
export const getServerFocusSnapshot = focusStore.getServerSnapshot
export const hydrateFocus = focusStore.hydrate
export const updateFocus = focusStore.update
