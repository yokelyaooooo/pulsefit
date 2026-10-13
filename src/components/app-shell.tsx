"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { AudioLines, Dumbbell, House, Library, Search, Timer, UserRound } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { MiniPlayer } from "@/components/mini-player"
import { NowPlaying } from "@/components/now-playing"
import { usePlayer } from "@/components/player-provider"
import { ThemeBridge } from "@/components/theme-bridge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatClock } from "@/lib/audio/clock"

const nav = [
  { href: "/", label: "首页", icon: House, color: "#FF9F0A" },
  { href: "/search", label: "搜索", icon: Search, color: "#FF2D55" },
  { href: "/library", label: "曲库", icon: Library, color: "#30D158" },
  { href: "/train", label: "训记", icon: Dumbbell, color: "#5E5CE6" },
]

export function BootScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#f2f2f7] text-[#1c1c1e]">
      <div className="text-center">
        <BrandMark className="mx-auto size-16" />
        <div className="t-1 mt-4">燃律</div>
        <div className="t-caption mt-1 text-[color:var(--label-secondary)]">PulseFit</div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const player = usePlayer()
  const [open, setOpen] = useState(false)
  const onPlayRoute = pathname === "/play"

  return (
    <div className="min-h-dvh bg-[#f2f2f7] text-[#1c1c1e]">
      <ThemeBridge />
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        <div className="relative min-h-dvh lg:border-r lg:border-black/8">
          <div className="flex items-center justify-between px-5 pt-[max(0.7rem,env(safe-area-inset-top))]">
            <BrandMark className="size-8" />
            <span className="flex items-center gap-3">
              <Link href="/session" className="ios-link flex items-center gap-1 t-sub">
                <Timer className="size-4" />
                间歇
              </Link>
              <Link href="/sources" className="ios-link flex items-center gap-1 t-sub">
                <AudioLines className="size-4" />
                音源
              </Link>
              <Link href="/me" className="ios-link flex items-center gap-1 t-sub">
                <UserRound className="size-4" />
                我的
              </Link>
            </span>
          </div>
          <div className="px-5 pt-3 pb-[calc(10.5rem+env(safe-area-inset-bottom))]">
            {player.error ? (
              <div className="ios-card mb-4 px-3.5 py-2.5 text-sm text-[#ff3b30]" role="alert">
                {player.error}
              </div>
            ) : null}
            {player.notice ? (
              <div className="ios-card mb-4 flex items-start justify-between gap-3 px-3.5 py-2.5 text-sm">
                <p>{player.notice}</p>
                <button type="button" className="ios-link shrink-0 text-[13px]" onClick={player.dismissNotice}>
                  知道了
                </button>
              </div>
            ) : null}
            {children}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(0.55rem,env(safe-area-inset-bottom))]">
            <MiniPlayer onOpen={() => setOpen(true)} />
            <nav className="liquid-glass pointer-events-auto rounded-[28px] px-1.5 py-1">
              <ul className="grid grid-cols-4">
                {nav.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex flex-col items-center gap-0.5 py-1.5"
                        style={{ color: item.color, opacity: active ? 1 : 0.42 }}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="size-[23px]" strokeWidth={active ? 2.4 : 1.75} />
                        <span className="text-[10px] leading-3 font-medium tracking-tight">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
        <aside className="hidden bg-black lg:block">
          <div className="sticky top-0 h-dvh">
            <NowPlaying />
          </div>
        </aside>
      </div>

      {open && !onPlayRoute ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black lg:hidden">
          <NowPlaying onClose={() => setOpen(false)} />
        </div>
      ) : null}

      <Dialog open={Boolean(player.summary)} onOpenChange={(value) => !value && player.dismissSummary()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="t-3">{player.summary?.finished ? "这轮练完了" : "训练已记下"}</DialogTitle>
            <DialogDescription>
              {player.summary
                ? `${player.summary.planName} · ${formatClock(player.summary.durationSec)} · ${player.summary.bpm} BPM`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="t-sub text-[#3a3a3c]">
            {player.summary?.finished
              ? "间歇记录在「我的」里。力量组数在「训记」。"
              : "这次提前结束了，时长仍然记着。"}
          </p>
          <DialogFooter>
            <Button onClick={player.dismissSummary}>好</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
