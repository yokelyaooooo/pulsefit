"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Dumbbell, House, Library, Search } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { formatClock } from "@/lib/audio/clock"

const nav = [
  { href: "/", label: "首页", icon: House },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/library", label: "曲库", icon: Library },
  { href: "/train", label: "训记", icon: Dumbbell },
]

export function BootScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background text-foreground">
      <div className="text-center">
        <div className="text-xs tracking-[0.28em] text-ember uppercase">PulseFit</div>
        <div className="mt-2 text-3xl font-semibold">燃律</div>
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
    <div className="min-h-dvh bg-background text-foreground">
      <ThemeBridge />
      <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <div className="relative min-h-dvh border-white/6 lg:border-r">
          <div className="flex items-center justify-between px-4 pt-4 text-xs text-muted-foreground">
            <span className="tracking-[0.22em] text-ember uppercase">PulseFit</span>
            <span className="flex gap-3">
              <Link href="/session" className="hover:text-foreground">
                间歇
              </Link>
              <Link href="/sources" className="hover:text-foreground">
                音源
              </Link>
              <Link href="/me" className="hover:text-foreground">
                我的
              </Link>
            </span>
          </div>
          <div className={cn("px-4 pt-3 pb-40 sm:px-5", player.now ? "pb-48" : "pb-32")}>
            {player.error ? (
              <div className="mb-4 rounded-2xl border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember" role="alert">
                {player.error}
              </div>
            ) : null}
            {player.notice ? (
              <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl bg-white/8 px-3 py-2 text-sm text-foreground">
                <p>{player.notice}</p>
                <button type="button" className="shrink-0 text-xs text-muted-foreground" onClick={player.dismissNotice}>
                  知道了
                </button>
              </div>
            ) : null}
            {children}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))]">
            <MiniPlayer onOpen={() => setOpen(true)} />
            <nav className="glass pointer-events-auto rounded-full px-2">
              <ul className="grid grid-cols-4">
                {nav.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                          active ? "text-foreground" : "text-muted-foreground"
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="size-5" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-0 h-dvh">
            <NowPlaying />
          </div>
        </aside>
      </div>

      {open && !onPlayRoute ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-background/80 backdrop-blur-xl lg:hidden">
          <NowPlaying onClose={() => setOpen(false)} />
        </div>
      ) : null}

      <Dialog open={Boolean(player.summary)} onOpenChange={(value) => !value && player.dismissSummary()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{player.summary?.finished ? "这轮练完了" : "训练已记下"}</DialogTitle>
            <DialogDescription>
              {player.summary
                ? `${player.summary.planName} · ${formatClock(player.summary.durationSec)} · ${player.summary.bpm} BPM`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">
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
