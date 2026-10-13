"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Paint } from "@/components/artwork"
import { ExerciseIcon } from "@/components/exercise-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { builtinExercises, monogramGlyph } from "@/lib/trainlog/exercises"
import { allPlans, getServerTrainSnapshot, getTrainSnapshot, hydrateTrain, subscribeTrain, updateTrain } from "@/lib/trainlog/store"
import { MUSCLES, muscleLabel, type ExerciseDef, type MuscleId, type PlanDef, type TrainFocus } from "@/lib/trainlog/types"
import { cn } from "@/lib/utils"

const focuses: TrainFocus[] = ["push", "pull", "legs", "shoulders", "cardio", "core"]
const focusName: Record<TrainFocus, string> = {
  push: "推",
  pull: "拉",
  legs: "腿臀",
  shoulders: "肩",
  cardio: "有氧",
  core: "核心",
}

export function TrainLibraryScreen() {
  const train = useSyncExternalStore(subscribeTrain, getTrainSnapshot, getServerTrainSnapshot)
  const [name, setName] = useState("")
  const [muscles, setMuscles] = useState<MuscleId[]>(["chest"])
  const [planName, setPlanName] = useState("")
  const [planFocus, setPlanFocus] = useState<TrainFocus>("push")
  const [planExercises, setPlanExercises] = useState<string[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    queueMicrotask(hydrateTrain)
  }, [])

  const exercises = [...builtinExercises, ...train.customExercises].filter((exercise) =>
    exercise.name.includes(query.trim())
  )

  return (
    <div className="space-y-8">
      <header>
        <Link href="/train" className="ios-link t-sub">
          返回训记
        </Link>
        <h1 className="t-large mt-2">动作与计划</h1>
        <p className="t-sub mt-1">内置计划可以直接开练。下面也能加你自己的动作和计划。</p>
      </header>

      <section className="space-y-2">
        <h2 className="t-2">计划</h2>
        {allPlans(train).map((plan) => (
          <article key={plan.id} className="ios-card overflow-hidden">
            <Paint tone={plan.focus} className="flex items-end justify-between p-3">
              <div>
                <div className="t-headline">{plan.name}</div>
                <p className="t-caption mt-0.5 text-white/80">{plan.blurb}</p>
              </div>
              <div className="flex">
                {plan.exerciseIds.slice(0, 3).map((id) => {
                  const exercise = builtinExercises.find((item) => item.id === id)
                  return exercise ? <ExerciseIcon key={id} exerciseId={exercise.id} className="size-8" /> : null
                })}
              </div>
            </Paint>
            {!plan.builtin ? (
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => updateTrain({ customPlans: getTrainSnapshot().customPlans.filter((item) => item.id !== plan.id) })}
              >
                删除
              </Button>
            ) : null}
          </article>
        ))}
      </section>

      <section className="ios-card space-y-3 p-4">
        <h2 className="t-2">自定义计划</h2>
        <Input value={planName} onChange={(event) => setPlanName(event.target.value)} placeholder="计划名称" aria-label="计划名称" />
        <div className="flex flex-wrap gap-2">
          {focuses.map((focus) => (
            <Button key={focus} type="button" size="sm" variant={planFocus === focus ? "default" : "secondary"} onClick={() => setPlanFocus(focus)}>
              {focusName[focus]}
            </Button>
          ))}
        </div>
        <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
          {builtinExercises.map((exercise) => {
            const on = planExercises.includes(exercise.id)
            return (
              <button
                key={exercise.id}
                type="button"
                className={cn(
                  "flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 text-[13px]",
                  on ? "bg-[#1c1c1e] text-white" : "bg-[var(--fill)]"
                )}
                onClick={() =>
                  setPlanExercises((current) => (on ? current.filter((id) => id !== exercise.id) : [...current, exercise.id]))
                }
              >
                <ExerciseIcon exerciseId={exercise.id} className="size-6" />
                {exercise.name}
              </button>
            )
          })}
        </div>
        <Button
          disabled={!planName.trim() || planExercises.length === 0}
          onClick={() => {
            const plan: PlanDef = {
              id: `custom-plan-${Date.now()}`,
              name: planName.trim(),
              focus: planFocus,
              blurb: "自己的计划",
              exerciseIds: planExercises,
              builtin: false,
            }
            updateTrain({ customPlans: [plan, ...getTrainSnapshot().customPlans] })
            setPlanName("")
            setPlanExercises([])
          }}
        >
          保存计划
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="t-2">动作</h2>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="筛选动作" aria-label="筛选动作" />
        <ul className="space-y-2">
          {exercises.map((exercise) => (
            <li key={exercise.id} className="ios-row flex items-center gap-3 px-2 py-2">
              <ExerciseIcon exerciseId={exercise.id} className="size-10" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{exercise.name}</div>
                <div className="truncate text-xs text-muted-foreground">{exercise.muscles.map((id) => muscleLabel[id]).join(" · ")}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="ios-card space-y-3 p-4">
        <h2 className="t-2">自定义动作</h2>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="动作名称" aria-label="动作名称" />
        <div className="flex flex-wrap gap-2">
          {MUSCLES.map(([id, label]) => {
            const on = muscles.includes(id)
            return (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={on ? "default" : "secondary"}
                onClick={() => setMuscles((current) => (on ? current.filter((item) => item !== id) : [...current, id]))}
              >
                {label}
              </Button>
            )
          })}
        </div>
        <Button
          disabled={!name.trim() || muscles.length === 0}
          onClick={() => {
            const exercise: ExerciseDef = {
              id: `custom-${Date.now()}`,
              name: name.trim(),
              muscles,
              equipment: "bodyweight",
              focus: ["core"],
              defaultMode: "bodyweight",
              glyph: monogramGlyph(name.trim()),
              builtin: false,
            }
            updateTrain({ customExercises: [exercise, ...getTrainSnapshot().customExercises] })
            setName("")
          }}
        >
          保存动作
        </Button>
      </section>
    </div>
  )
}
