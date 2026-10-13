"use client"

import { useEffect } from "react"
import { hydratePersisted } from "@/lib/storage"

export function usePersistedStore() {
  useEffect(() => {
    queueMicrotask(hydratePersisted)
  }, [])
}
