"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getFocus } from "@/lib/training/focus"

export function ThemeBridge() {
  const pathname = usePathname()

  useEffect(() => {
    const id = pathname.match(/^\/focus\/([^/]+)/)?.[1]
    const focus = id ? getFocus(id) : undefined
    const root = document.documentElement
    if (!focus) {
      delete root.dataset.theme
      root.style.removeProperty("--theme-a")
      root.style.removeProperty("--theme-b")
      root.style.removeProperty("--primary")
      return
    }
    root.dataset.theme = focus.id
    root.style.setProperty("--theme-a", focus.accent)
    root.style.setProperty("--theme-b", focus.accent2)
    root.style.setProperty("--primary", focus.accent)
  }, [pathname])

  return null
}
