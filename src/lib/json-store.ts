export function createJsonStore<T extends object>(
  key: string,
  parse: (raw: string | null) => T,
  serverSnapshot: T
) {
  let snapshot = serverSnapshot
  let hydrated = false
  const listeners = new Set<() => void>()

  function read(): T {
    if (typeof window === "undefined") return serverSnapshot
    try {
      return parse(window.localStorage.getItem(key))
    } catch {
      return serverSnapshot
    }
  }

  function write(value: T) {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Private mode and a full disk both keep the in-memory copy.
    }
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return snapshot
    },
    getServerSnapshot() {
      return serverSnapshot
    },
    hydrate() {
      if (hydrated || typeof window === "undefined") return
      snapshot = read()
      hydrated = true
      listeners.forEach((listener) => listener())
    },
    update(patch: Partial<T>) {
      if (!hydrated && typeof window !== "undefined") {
        snapshot = read()
        hydrated = true
      }
      snapshot = { ...snapshot, ...patch }
      write(snapshot)
      listeners.forEach((listener) => listener())
    },
  }
}
