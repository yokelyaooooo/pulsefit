"use client"

import { useState } from "react"
import { Clock3, Heart, TimerReset } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { Paint } from "@/components/artwork"
import { getPlan } from "@/lib/catalog"
import { usePersistedStore } from "@/components/use-persisted-store"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { formatClock } from "@/lib/audio/clock"

export function MeScreen() {
  const player = usePlayer()
  usePersistedStore()
  const [confirm, setConfirm] = useState(false)
  const minutes = Math.round(player.sessions.reduce((sum, session) => sum + session.durationSec, 0) / 60)
  const finished = player.sessions.filter((session) => session.finished).length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="t-large">我的</h1>
        <p className="t-sub mt-1">训练记录留在这台设备上。音量、收藏和历史都写在本地。</p>
      </header>

      <div className="grid grid-cols-3 gap-2">
          {(
            [
              { label: "完成", value: String(finished), icon: TimerReset, tone: "hiit" },
              { label: "分钟", value: String(minutes), icon: Clock3, tone: "cardio" },
              { label: "收藏", value: String(player.favorites.length), icon: Heart, tone: "pull" },
            ] as const
          ).map((stat) => {
            const Icon = stat.icon
            return (
            <Paint key={stat.label} tone={stat.tone} className="rounded-[18px] px-3 py-3.5">
              <Icon className="relative size-5" />
              <div className="t-1 relative mt-3 tabular-nums">{stat.value}</div>
              <div className="t-caption relative text-white/80">{stat.label}</div>
            </Paint>
            )
          })}
        </div>

      <label className="ios-card block space-y-3 px-4 py-4">
        <span className="flex justify-between text-sm">
          音量
          <span className="text-muted-foreground tabular-nums">{Math.round(player.volume * 100)}</span>
        </span>
        <Slider
          aria-label="音量"
          min={0}
          max={100}
          step={1}
          value={[Math.round(player.volume * 100)]}
          onValueChange={(value) => player.setVolume((value[0] ?? 80) / 100)}
        />
      </label>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="t-2">训练记录</h2>
          {player.sessions.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}>
              清空
            </Button>
          ) : null}
        </div>
        {player.sessions.length === 0 ? (
          <Paint tone="recover" className="rounded-[22px] px-4 py-8">
            <p className="t-headline relative">还没有训练记录</p>
            <p className="t-caption relative mt-1 text-white/80">从首页开始一轮间歇，结束后会记在这里。</p>
          </Paint>
        ) : (
          <ul className="space-y-2">
            {player.sessions.map((session) => (
              <li key={session.id} className="ios-row flex items-center gap-3 px-2.5 py-2.5">
                <Paint tone={getPlan(session.planId)?.tag ?? "strength"} className="size-12 shrink-0 rounded-[12px]" />
                <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="t-headline truncate">{session.planName}</span>
                  <span className="t-sub shrink-0 tabular-nums">{formatClock(session.durationSec)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {session.finished ? "完成" : "提前结束"} · {session.bpm} BPM ·{" "}
                  {new Date(session.completedAt).toLocaleString("zh-CN", { hour12: false })}
                </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ios-card flex items-center gap-3 px-4 py-4 text-sm leading-6 text-[color:var(--label-secondary)]">
        <BrandMark className="size-14" />
        <div>
        <p className="font-medium text-foreground">燃律 PulseFit</p>
        <p className="mt-1">应用 ID：com.pulsefit.app</p>
        <p>同一套播放器给 iOS、Android 和鸿蒙。网页版现在就能用，原生壳用这个 ID 打包。</p>
        </div>
      </section>

      {player.audioLocked ? (
        <p className="text-sm text-[#ff3b30]" role="status">
          声音还没解锁。回到播放页再点一次播放。
        </p>
      ) : null}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>清空训练记录？</DialogTitle>
            <DialogDescription>收藏和音量会留下，只删历史。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                player.clearSessions()
                setConfirm(false)
              }}
            >
              清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
