"use client"

import { useState } from "react"
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
        <h1 className="text-3xl font-semibold tracking-tight">我的</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          训练记录留在这台设备上。音量、收藏和历史都写在本地。
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2">
          {[
            ["完成", String(finished)],
            ["分钟", String(minutes)],
            ["收藏", String(player.favorites.length)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-card px-3 py-4 ring-1 ring-white/8">
              <div className="text-2xl font-semibold tabular-nums">{value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

      <label className="block space-y-3 rounded-2xl bg-card px-4 py-4 ring-1 ring-white/8">
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
          <h2 className="text-sm font-medium text-muted-foreground">训练记录</h2>
          {player.sessions.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}>
              清空
            </Button>
          ) : null}
        </div>
        {player.sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center">
            <p className="font-medium">还没有训练记录</p>
            <p className="mt-1 text-sm text-muted-foreground">从首页开始一轮间歇，结束后会记在这里。</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {player.sessions.map((session) => (
              <li key={session.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-white/8">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{session.planName}</span>
                  <span className="text-sm text-gold tabular-nums">{formatClock(session.durationSec)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {session.finished ? "完成" : "提前结束"} · {session.bpm} BPM ·{" "}
                  {new Date(session.completedAt).toLocaleString("zh-CN", { hour12: false })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-card px-4 py-4 text-sm leading-6 text-muted-foreground ring-1 ring-white/8">
        <p className="font-medium text-foreground">燃律 PulseFit</p>
        <p className="mt-1">应用 ID：com.pulsefit.app</p>
        <p>同一套播放器给 iOS、Android 和鸿蒙。网页版现在就能用，原生壳用这个 ID 打包。</p>
      </section>

      {player.audioLocked ? (
        <p className="text-sm text-ember" role="status">
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
