import { muscleLabel, type MuscleId } from "@/lib/trainlog/types"

const front: Array<{ id: MuscleId; d: string; label: { x: number; y: number; anchor: "start" | "end" | "middle" } }> = [
  { id: "traps", d: "M48 46h24l-5 14H53z", label: { x: 60, y: 40, anchor: "middle" } },
  { id: "front-delt", d: "M34 62c8 2 10 14 4 20l-12-6zM86 62c-8 2-10 14-4 20l12-6z", label: { x: -2, y: 72, anchor: "end" } },
  { id: "side-delt", d: "M20 72c7 1 10 12 3 16l-8-5zM100 72c-7 1-10 12-3 16l8-5z", label: { x: 122, y: 92, anchor: "start" } },
  { id: "chest", d: "M44 64h32c2 14-6 24-16 24s-18-10-16-24z", label: { x: 122, y: 78, anchor: "start" } },
  { id: "biceps", d: "M30 86c8 2 10 16 2 24l-10-8zM90 86c-8 2-10 16-2 24l10-8z", label: { x: -2, y: 100, anchor: "end" } },
  { id: "forearm", d: "M24 116c8 0 10 18 4 30l-10-6zM96 116c-8 0-10 18-4 30l10-6z", label: { x: -2, y: 136, anchor: "end" } },
  { id: "abs", d: "M52 92h16v34H52z", label: { x: 122, y: 112, anchor: "start" } },
  { id: "obliques", d: "M42 96h8v28h-8zM70 96h8v28h-8z", label: { x: 122, y: 128, anchor: "start" } },
  { id: "quads", d: "M46 150h12v48H46zM62 150h12v48H62z", label: { x: 122, y: 176, anchor: "start" } },
  { id: "calves", d: "M48 206h8v28h-8zM64 206h8v28h-8z", label: { x: 122, y: 220, anchor: "start" } },
]

const back: Array<{ id: MuscleId; d: string; label: { x: number; y: number; anchor: "start" | "end" | "middle" } }> = [
  { id: "traps", d: "M46 44h28l-8 22H54z", label: { x: 60, y: 40, anchor: "middle" } },
  { id: "rear-delt", d: "M32 64c10 0 12 14 4 20l-12-4zM88 64c-10 0-12 14-4 20l12-4z", label: { x: -2, y: 74, anchor: "end" } },
  { id: "upper-back", d: "M48 66h24v16H48z", label: { x: 122, y: 76, anchor: "start" } },
  { id: "lats", d: "M40 82c8 2 10 22 4 32h-12zM80 82c-8 2-10 22-4 32h12z", label: { x: -2, y: 104, anchor: "end" } },
  { id: "triceps", d: "M28 88c8 2 8 18 0 26l-8-8zM92 88c-8 2-8 18 0 26l8-8z", label: { x: 122, y: 104, anchor: "start" } },
  { id: "lower-back", d: "M52 108h16v22H52z", label: { x: 122, y: 122, anchor: "start" } },
  { id: "glutes", d: "M44 134h14v22H44zM62 134h14v22H62z", label: { x: -2, y: 148, anchor: "end" } },
  { id: "hamstrings", d: "M46 160h12v40H46zM62 160h12v40H62z", label: { x: 122, y: 182, anchor: "start" } },
  { id: "calves", d: "M48 206h8v28h-8zM64 206h8v28h-8z", label: { x: -2, y: 220, anchor: "end" } },
]

const body =
  "M60 18a10 10 0 1 0 .1 0M48 36c-8 8-14 20-12 36 6 4 14 6 24 6s18-2 24-6c2-16-4-28-12-36-6 6-18 6-24 0zM34 78c-8 10-12 28-8 52l10 8 6-28c4 2 10 2 16 0V92H34zm52 0c8 10 12 28 8 52l-10 8-6-28c-4 2-10 2-16 0V92h24zM46 148c-2 20-2 48 2 78h8c2-24 2-48 0-78zm20 0c2 20 2 48 0 78h8c-4-30-4-58-2-78z"

function Figure({
  label,
  regions,
  active,
}: {
  label: string
  regions: typeof front
  active: Set<MuscleId>
}) {
  return (
    <svg viewBox="-46 8 212 246" className="h-64 w-full" role="img" aria-label={label}>
      <path d={body} fill="#E6EAF0" stroke="#C5CDD8" strokeWidth="1.1" />
      {regions.map((region) => {
        const on = active.has(region.id)
        return (
          <path key={`${label}-${region.id}`} d={region.d} fill={on ? "#5B67F1" : "#D5DBE3"} opacity={on ? 0.95 : 0.9}>
            <title>{muscleLabel[region.id]}</title>
          </path>
        )
      })}
      {regions
        .filter((region) => active.has(region.id))
        .map((region) => (
          <text
            key={`${label}-label-${region.id}`}
            x={region.label.x}
            y={region.label.y}
            textAnchor={region.label.anchor}
            fill="#8E8E93"
            fontSize="9"
            fontFamily="-apple-system, PingFang SC, sans-serif"
          >
            {muscleLabel[region.id]}
          </text>
        ))}
      <text x="60" y="246" textAnchor="middle" fill="#8E8E93" fontSize="11" fontFamily="-apple-system, PingFang SC, sans-serif">
        {label}
      </text>
    </svg>
  )
}

export function MuscleMap({ active }: { active: MuscleId[] }) {
  const selected = new Set(active)
  return (
    <div className="grid grid-cols-2 gap-1">
      <Figure label="正面" regions={front} active={selected} />
      <Figure label="背面" regions={back} active={selected} />
    </div>
  )
}
