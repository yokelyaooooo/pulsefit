"use client"

import { useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Play, Search } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { FocusTile } from "@/components/focus-tile"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
import { Paint } from "@/components/artwork"
import { getPlan, getTrack, plans, suggestedPlanId, tracks } from "@/lib/catalog"
import { hydratePersisted } from "@/lib/storage"
import { focuses } from "@/lib/training/focus"
import { formatClock } from "@/lib/audio/clock"
import { planDuration } from "@/lib/workout"
import { cn } from "@/lib/utils"

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
        <h1 className="t-large">燃律</h1>
        <p className="t-sub mt-1">{clock.line}</p>
      </header>

      <Link href="/search" className="flex h-11 items-center gap-2 rounded-[12px] bg-[var(--fill)] px-3 text-[17px] text-[color:var(--label-secondary)]">
        <Search className="size-4" />
        搜索训练日、动作或歌曲
      </Link>

      <section>
        <h2 className="t-2 mb-3">训练日</h2>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {days.map((focus) => (
            <FocusTile key={focus.id} focus={focus} className="h-[148px] w-[168px] shrink-0" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="t-2 mb-3">动作</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {lifts.map((focus) => (
            <FocusTile key={focus.id} focus={focus} className="h-[96px] p-3" />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="t-2">本地专辑</h2>
          <Link href="/library" className="ios-link t-sub">
            全部
          </Link>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {tracks.map((track) => (
            <button
              key={track.id}
              type="button"
              className="w-[132px] shrink-0 text-left"
              onClick={() => void player.playTrack(track.id, { queue: tracks.map((item) => item.id) })}
            >
              <CoverArt seed={track.id} title={track.title} className="aspect-square w-full rounded-[16px] shadow-[0_8px_18px_rgba(28,28,30,0.12)]" />
              <div className="t-headline mt-2 truncate text-[15px]">{track.title}</div>
              <div className="t-caption truncate text-[color:var(--label-secondary)]">{track.bpm} BPM</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="t-2 mb-3">间歇</h2>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {plans.map((item) => {
            const selected = item.id === plan.id
            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "w-[168px] shrink-0 overflow-hidden rounded-[18px] text-left shadow-[0_12px_24px_rgba(28,28,30,0.12)]",
                  selected ? "ring-2 ring-[#1c1c1e]" : ""
                )}
                onClick={() => {
                  clockSnapshot = { ...clockSnapshot, planId: item.id }
                  clockListeners.forEach((listener) => listener())
                }}
              >
                <Paint tone={item.tag} className="relative h-[148px] p-3.5">
                  <span className="t-caption relative text-white/85">{formatClock(planDuration(item))}</span>
                  <span className="t-headline relative mt-6 block">{item.name}</span>
                  <span className="t-caption relative text-white/80">{item.bpm} BPM</span>
                </Paint>
              </button>
            )
          })}
        </div>
        <div className="ios-card mt-3 flex items-center gap-3 p-3">
          <CoverArt
            seed={getTrack(plan.trackId)?.id ?? plan.id}
            title={plan.name}
            className="size-16 shrink-0 rounded-[14px]"
          />
          <div className="min-w-0 flex-1">
            <div className="t-headline truncate">{plan.name}</div>
            <div className="t-caption mt-0.5 text-[color:var(--label-secondary)]">{plan.blurb}</div>
          </div>
          <Button
            className="shrink-0"
            onClick={() => {
              void player.startWorkout(plan.id)
              router.push("/session")
            }}
          >
            <Play className="fill-current" />
            开始
          </Button>
        </div>
      </section>
    </div>
  )
}
