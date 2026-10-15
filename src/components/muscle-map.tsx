"use client"

import { useEffect, useId, useSyncExternalStore } from "react"
import maleAnatomy from "@/lib/trainlog/anatomy.json"
import femaleAnatomy from "@/lib/trainlog/anatomy-female.json"
import { getServerTrainSnapshot, getTrainSnapshot, hydrateTrain, subscribeTrain, updateTrain } from "@/lib/trainlog/store"
import { muscleLabel, type MuscleId } from "@/lib/trainlog/types"
import styles from "./muscle-map.module.css"

const neutral = new Set(["head", "hair", "hands", "feet", "neck", "ankles", "knees"])

const frontSlug: Partial<Record<MuscleId, string>> = {
  chest: "chest",
  "front-delt": "deltoids",
  "side-delt": "deltoids",
  biceps: "biceps",
  triceps: "triceps",
  forearm: "forearm",
  abs: "abs",
  obliques: "obliques",
  quads: "quadriceps",
  calves: "calves",
  traps: "trapezius",
}

const backSlug: Partial<Record<MuscleId, string>> = {
  traps: "trapezius",
  "rear-delt": "deltoids",
  "side-delt": "deltoids",
  "upper-back": "upper-back",
  lats: "upper-back",
  triceps: "triceps",
  "lower-back": "lower-back",
  glutes: "gluteal",
  hamstrings: "hamstring",
  calves: "calves",
  forearm: "forearm",
}

function Figure({
  side,
  active,
  gender,
}: {
  side: "front" | "back"
  active: MuscleId[]
  gender: "male" | "female"
}) {
  const id = useId().replace(/:/g, "")
  const map = side === "front" ? frontSlug : backSlug
  const anatomy = gender === "female" ? femaleAnatomy : maleAnatomy
  const body = anatomy[side]
  const slugs = new Set(active.map((id) => map[id]).filter((slug): slug is string => Boolean(slug)))
  const labels = active.filter((id) => map[id])
  return (
    <figure className={styles.figure}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={body.viewBox} className={styles.body} role="img" aria-label={`${gender === "female" ? "女性" : "男性"}${side === "front" ? "正面" : "背面"}肌肉图${labels.length ? `：${labels.map((id) => muscleLabel[id]).join("、")}` : ""}`}>
        <defs>
          <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2=".2"><stop stopColor="#e8e9ef" /><stop offset=".5" stopColor="#f3f3f7" /><stop offset="1" stopColor="#d7dbe5" /></linearGradient>
          <linearGradient id={`${id}-active`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#b69ada" /><stop offset=".5" stopColor="#9374bd" /><stop offset="1" stopColor="#755aa1" /></linearGradient>
          <linearGradient id={`${id}-muscle`} x1="0" y1="0" x2="1" y2=".4"><stop stopColor="#d8dce6" /><stop offset=".45" stopColor="#e4e6ed" /><stop offset="1" stopColor="#bdc5d5" /></linearGradient>
        </defs>
        <path d={`${body.outline} Z`} fill={`url(#${id}-skin)`} stroke="#bcc3d1" strokeWidth="2" strokeLinejoin="round" />
        {body.parts.map((part) => {
          const selected = slugs.has(part.slug)
          const fill = selected ? `url(#${id}-active)` : neutral.has(part.slug) ? `url(#${id}-skin)` : `url(#${id}-muscle)`
          return part.paths.map((d, index) => <path key={`${part.slug}-${index}`} d={d} fill={fill} stroke={selected ? "#785aa3" : "#bbc3d2"} strokeWidth={selected ? "1.6" : ".65"} strokeLinejoin="round" data-muscle={part.slug} data-highlighted={selected ? "true" : undefined}><title>{selected ? labels.filter((muscle) => map[muscle] === part.slug).map((muscle) => muscleLabel[muscle]).join(" / ") : ""}</title></path>)
        })}
      </svg>
      <figcaption className="t-caption mt-1 text-center text-[color:var(--label-secondary)]">
        {side === "front" ? "正面" : "背面"}
      </figcaption>
      {labels.length > 0 ? (
        <ul className={styles.labels}>
          {labels.map((id) => (
            <li key={id}>
              {muscleLabel[id]}
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  )
}

export function MuscleMap({ active }: { active: MuscleId[] }) {
  const state = useSyncExternalStore(subscribeTrain, getTrainSnapshot, getServerTrainSnapshot)
  const gender = state.bodyGender ?? "male"
  useEffect(() => { queueMicrotask(hydrateTrain) }, [])
  return (
    <div className={styles.map}>
      <div className={styles.toolbar}><span><i />目标肌群</span><div role="group" aria-label="人体模型性别">{(["male", "female"] as const).map((value) => <button type="button" key={value} aria-pressed={gender === value} onClick={() => updateTrain({ bodyGender: value })}>{value === "male" ? "男" : "女"}</button>)}</div></div>
      <div className={styles.figures}>
        <Figure side="front" active={active} gender={gender} />
        <Figure side="back" active={active} gender={gender} />
      </div>
    </div>
  )
}
