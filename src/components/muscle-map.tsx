import type { MuscleId } from "@/lib/trainlog/types"

const front: Array<{ id: MuscleId; d: string }> = [
  { id: "traps", d: "M48 46h24l-5 14H53z" },
  { id: "front-delt", d: "M34 62c8 2 10 14 4 20l-12-6zM86 62c-8 2-10 14-4 20l12-6z" },
  { id: "chest", d: "M44 64h32c2 14-6 24-16 24s-18-10-16-24z" },
  { id: "biceps", d: "M30 86c8 2 10 16 2 24l-10-8zM90 86c-8 2-10 16-2 24l10-8z" },
  { id: "forearm", d: "M24 116c8 0 10 18 4 30l-10-6zM96 116c-8 0-10 18-4 30l10-6z" },
  { id: "abs", d: "M52 92h16v34H52z" },
  { id: "obliques", d: "M42 96h8v28h-8zM70 96h8v28h-8z" },
  { id: "quads", d: "M46 150h12v48H46zM62 150h12v48H62z" },
  { id: "calves", d: "M48 206h8v28h-8zM64 206h8v28h-8z" },
]

const back: Array<{ id: MuscleId; d: string }> = [
  { id: "traps", d: "M46 44h28l-8 22H54z" },
  { id: "rear-delt", d: "M32 64c10 0 12 14 4 20l-12-4zM88 64c-10 0-12 14-4 20l12-4z" },
  { id: "upper-back", d: "M48 66h24v16H48z" },
  { id: "lats", d: "M40 82c8 2 10 22 4 32h-12zM80 82c-8 2-10 22-4 32h12z" },
  { id: "triceps", d: "M28 88c8 2 8 18 0 26l-8-8zM92 88c-8 2-8 18 0 26l8-8z" },
  { id: "lower-back", d: "M52 108h16v22H52z" },
  { id: "glutes", d: "M44 134h14v22H44zM62 134h14v22H62z" },
  { id: "hamstrings", d: "M46 160h12v40H46zM62 160h12v40H62z" },
  { id: "calves", d: "M48 206h8v28h-8zM64 206h8v28h-8z" },
]

function Figure({
  label,
  regions,
  active,
}: {
  label: string
  regions: Array<{ id: MuscleId; d: string }>
  active: Set<MuscleId>
}) {
  return (
    <svg viewBox="0 0 120 250" className="h-64 w-full" role="img" aria-label={label}>
      <path
        d="M60 18a10 10 0 1 0 .1 0M48 36c-8 8-14 20-12 36 6 4 14 6 24 6s18-2 24-6c2-16-4-28-12-36-6 6-18 6-24 0zM34 78c-8 10-12 28-8 52l10 8 6-28c4 2 10 2 16 0V92H34zm52 0c8 10 12 28 8 52l-10 8-6-28c-4 2-10 2-16 0V92h24zM46 148c-2 20-2 48 2 78h8c2-24 2-48 0-78zm20 0c2 20 2 48 0 78h8c-4-30-4-58-2-78z"
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.2)"
      />
      {regions.map((region) => (
        <path
          key={`${label}-${region.id}-${region.d.slice(0, 12)}`}
          d={region.d}
          fill={active.has(region.id) ? "var(--theme-a)" : "rgba(255,255,255,0.08)"}
        >
          <title>{region.id}</title>
        </path>
      ))}
      <text x="60" y="246" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="11">
        {label}
      </text>
    </svg>
  )
}

export function MuscleMap({ active }: { active: MuscleId[] }) {
  const selected = new Set(active)
  return (
    <div className="grid grid-cols-2 gap-2">
      <Figure label="正面" regions={front} active={selected} />
      <Figure label="背面" regions={back} active={selected} />
    </div>
  )
}
