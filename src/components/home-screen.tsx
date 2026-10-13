"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, Dumbbell, Flame, Flower2, Moon, Play } from "lucide-react"
import { usePlayer } from "@/components/player-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPlan, plans, suggestedPlanId, tagLabel, tracks } from "@/lib/catalog"
import { hydratePersisted } from "@/lib/storage"
import type { WorkoutTag } from "@/lib/types"
import { formatClock } from "@/lib/audio/clock"
import { planDuration } from "@/lib/workout"

const icons: Record<WorkoutTag, typeof Flame> = {
  hiit: Flame,
  strength: Dumbbell,
  cardio: Activity,
  yoga: Flower2,
  recover: Moon,
}

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
  const suggested = clock.planId
  const line = clock.line

  useEffect(() => {
    queueMicrotask(() => {
      publishClock()
      hydratePersisted()
    })
  }, [])
  const [chosen, setChosen] = useState<string | null>(null)
  const plan = getPlan(chosen ?? suggested) ?? plans[0]
  const Icon = icons[plan.tag]

  async function begin(id: string) {
    await player.startWorkout(id)
    router.push("/session")
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs tracking-[0.28em] text-ember uppercase">PulseFit</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">燃律</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{line}</p>
      </header>

      <Card className="overflow-hidden bg-[linear-gradient(160deg,rgba(255,77,26,0.18),rgba(255,197,109,0.05)_42%,transparent)]">
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="secondary">{tagLabel[plan.tag]}</Badge>
                <h2 className="mt-3 text-2xl font-semibold">{plan.name}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.blurb}</p>
              </div>
              <Icon className="size-8 text-ember" />
            </div>
            <p className="text-sm text-gold tabular-nums">
              {plan.bpm} BPM · {formatClock(planDuration(plan))}
              {plan.rounds > 1 ? ` · ${plan.rounds} 轮` : ""}
            </p>
            <Button className="h-11 rounded-full px-5" onClick={() => void begin(plan.id)}>
              <Play />
              开始这轮
            </Button>
          </CardContent>
        </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">换一种练法</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {plans.map((item) => {
            const ItemIcon = icons[item.tag]
            const active = item.id === plan.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setChosen(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                  active ? "border-ember bg-ember/15 text-foreground" : "border-white/10 text-muted-foreground"
                }`}
              >
                <ItemIcon className="size-4" />
                {item.name}
              </button>
            )
          })}
        </div>
      </section>

      {player.sessions[0] ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">上次</h2>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl bg-card px-4 py-3 text-left ring-1 ring-white/8"
            onClick={() => void begin(player.sessions[0].planId)}
          >
            <span>
              <span className="block font-medium">{player.sessions[0].planName}</span>
              <span className="text-xs text-muted-foreground">
                {player.sessions[0].finished ? "已完成" : "提前结束"} · {formatClock(player.sessions[0].durationSec)}
              </span>
            </span>
            <span className="text-sm text-ember">再来一轮</span>
          </button>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">现在就能放</h2>
          <Link href="/library" className="text-xs text-ember">
            全部曲目
          </Link>
        </div>
        <ul className="space-y-2">
          {tracks.slice(0, 4).map((track) => (
            <li key={track.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-2xl bg-card px-4 py-3 text-left ring-1 ring-white/8"
                onClick={() => void player.playTrack(track.id, { queue: tracks.map((item) => item.id), loop: false })}
              >
                <span>
                  <span className="block font-medium">
                    {track.title}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">{track.titleEn}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{track.blurb}</span>
                </span>
                <span className="text-sm text-gold tabular-nums">{track.bpm}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
