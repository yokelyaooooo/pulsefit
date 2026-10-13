import { builtinExercises } from "@/lib/trainlog/exercises"
import { cn } from "@/lib/utils"

const known = new Set(builtinExercises.map((exercise) => exercise.id))

export function ExerciseIcon({ exerciseId, className }: { exerciseId: string; className?: string }) {
  const file = known.has(exerciseId) ? exerciseId : "generic"
  return (
    <span className={cn("inline-grid shrink-0 place-items-center overflow-hidden rounded-[10px] bg-white shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.06)]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/exercises/${file}.svg`} alt="" className="size-[88%] object-contain" />
    </span>
  )
}
