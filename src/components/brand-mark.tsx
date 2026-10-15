import Image from "next/image"
import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return <Image src="/icon.png" alt="燃律 PulseFit" width={128} height={128} priority className={cn("shrink-0 rounded-[24%] object-cover", className)} />
}
