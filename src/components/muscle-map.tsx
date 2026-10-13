import anatomy from "@/lib/trainlog/anatomy.json"
import { muscleLabel, type MuscleId } from "@/lib/trainlog/types"

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
}: {
  side: "front" | "back"
  active: MuscleId[]
}) {
  const map = side === "front" ? frontSlug : backSlug
  const body = anatomy[side]
  const slugs = new Set(active.map((id) => map[id]).filter((slug): slug is string => Boolean(slug)))
  const labels = active.filter((id) => map[id])
  return (
    <figure className="min-w-0">
      <svg viewBox={body.viewBox} className="mx-auto h-52 w-full" role="img" aria-label={side === "front" ? "正面" : "背面"}>
        {body.parts.map((part) => {
          const fill = slugs.has(part.slug) ? "#5856D6" : neutral.has(part.slug) ? "#F4F6F9" : "#D5DDE8"
          return part.paths.map((d, index) => <path key={`${part.slug}-${index}`} d={d} fill={fill} />)
        })}
        <path d={body.outline} fill="none" stroke="#C5CED8" strokeWidth="3" />
      </svg>
      <figcaption className="t-caption mt-1 text-center text-[color:var(--label-secondary)]">
        {side === "front" ? "正面" : "背面"}
      </figcaption>
      {labels.length > 0 ? (
        <ul className="mt-1 flex flex-wrap justify-center gap-1">
          {labels.map((id) => (
            <li key={id} className="rounded-full bg-[#5856D6]/10 px-1.5 py-0.5 text-[10px] leading-4 text-[#5856D6]">
              {muscleLabel[id]}
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  )
}

export function MuscleMap({ active }: { active: MuscleId[] }) {
  return (
    <div className="grid grid-cols-2 gap-1">
      <Figure side="front" active={active} />
      <Figure side="back" active={active} />
    </div>
  )
}
