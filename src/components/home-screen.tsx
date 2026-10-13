"use client"

import { useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Play } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
import { getPlan, plans, suggestedPlanId, tracks } from "@/lib/catalog"
import { hydratePersisted } from "@/lib/storage"
import { focuses } from "@/lib/training/focus"
import { formatClock } from "@/lib/audio/clock"
import { planDuration } from "@/lib/workout"

const serverClock = {
  planId: "hiit",
  line: "把节拍锁在你的动作上。",
}
let clockSnapshot = serverClock
const clockListeners = new Set<() => void>()

function subscribeClock(listener: () => void) {
  clockListeners.add(listener)
  return () => clockListeners.delete(listener)
}

function getClockSnapshot() {
  return clockSnapshot
}

function getServerClockSnapshot() {
  return serverClock
}

function publishClock() {
  const hour = new Date().getHours()
  clockSnapshot = { planId: suggestedPlanId(hour), line: greeting(hour) }
  clockListeners.forEach((listener) => listener())
}

function greeting(hour: number) {
  if (hour < 5) return "还醒着的话，先做一段恢复。"
  if (hour < 11) return "早间适合把心率轻轻拉起来。"
  if (hour < 14) return "午后短间歇，刚好出一身汗。"
  if (hour < 18) return "下午的力量组，把节拍压稳。"
  return "把今天最后一段燃完。"
}

export function HomeScreen() {
  const router = useRouter()
  const player = usePlayer()
  const clock = useSyncExternalStore(subscribeClock, getClockSnapshot, getServerClockSnapshot)
  const plan = getPlan(clock.planId) ?? plans[0]

  useEffect(() => {
    queueMicrotask(() => {
      publishClock()
      hydratePersisted()
    })
  }, [])

  const days = focuses.filter((focus) => focus.kind === "day")
  const lifts = focuses.filter((focus) => focus.kind === "lift")

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight">燃律</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{clock.line}</p>
      </header>

      <Link
        href="/search"
        className="glass block rounded-2xl px-4 py-3 text-sm text-muted-foreground"
      >
        搜索训练日、动作或歌曲
      </Link>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-semibold">训练日</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {days.map((focus) => (
            <Link
              key={focus.id}
              href={`/focus/${focus.id}`}
              className="w-40 shrink-0 rounded-3xl p-4 text-left shadow-lg"
              style={{ background: `linear-gradient(160deg, ${focus.accent}, ${focus.ink})`, color: "white" }}
            >
              <div className="text-lg font-semibold">{focus.name}</div>
              <div className="mt-6 text-xs opacity-80">{focus.targetBpm} BPM</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">动作</h2>
        <div className="grid grid-cols-3 gap-2">
          {lifts.map((focus) => (
            <Link
              key={focus.id}
              href={`/focus/${focus.id}`}
              className="rounded-2xl px-3 py-4 text-sm font-medium"
              style={{ background: `linear-gradient(180deg, ${focus.accent}, ${focus.ink})`, color: "white" }}
            >
              {focus.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-semibold">本地专辑</h2>
          <Link href="/library" className="text-xs text-muted-foreground">
            全部
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {tracks.map((track) => (
            <button
              key={track.id}
              type="button"
              className="w-36 shrink-0 text-left"
              onClick={() => void player.playTrack(track.id, { queue: tracks.map((item) => item.id) })}
            >
              <CoverArt seed={track.id} title={track.title} className="aspect-square w-full rounded-2xl" />
              <div className="mt-2 truncate text-sm font-medium">{track.title}</div>
              <div className="truncate text-xs text-muted-foreground">{track.bpm} BPM</div>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-4">
        <p className="text-xs tracking-[0.18em] text-[var(--theme-a)] uppercase">间歇</p>
        <h2 className="mt-2 text-2xl font-semibold">{plan.name}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.blurb}</p>
        <p className="mt-3 text-xs text-muted-foreground tabular-nums">
          {plan.bpm} BPM · {formatClock(planDuration(plan))}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {plans.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={item.id === plan.id ? "default" : "secondary"}
              onClick={() => {
                clockSnapshot = { ...clockSnapshot, planId: item.id }
                clockListeners.forEach((listener) => listener())
              }}
            >
              {item.name}
            </Button>
          ))}
        </div>
        <Button
          className="mt-4 w-full"
          onClick={() => {
            void player.startWorkout(plan.id)
            router.push("/session")
          }}
        >
          <Play />
          开始这轮
        </Button>
      </section>
    </div>
  )
}
