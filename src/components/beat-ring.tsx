"use client"

import { useEffect, useId, useRef } from "react"
import { usePlayer } from "@/components/player-provider"

export function BeatRing({
  size = 280,
  label,
  caption,
}: {
  size?: number
  label: string
  caption?: string
}) {
  const { subscribeVisual } = usePlayer()
  const gradientId = useId().replace(/:/g, "")
  const ringRef = useRef<SVGCircleElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const radius = 42
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    return subscribeVisual((snapshot) => {
      const ring = ringRef.current
      const halo = haloRef.current
      if (!ring || !halo) return
      const dash = snapshot.playing ? snapshot.beatPhase : 0.08
      ring.style.strokeDashoffset = String(circumference * (1 - dash))
      halo.style.transform = snapshot.kick ? "scale(1.06)" : "scale(1)"
      halo.style.opacity = snapshot.playing ? String(0.45 + (1 - snapshot.beatPhase) * 0.55) : "0.35"
    })
  }, [circumference, subscribeVisual])

  return (
    <div className="relative mx-auto grid place-items-center" style={{ width: size, height: size }}>
      <div
        ref={haloRef}
        className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(255,77,26,0.45),transparent_68%)] transition-transform duration-100"
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          ref={ringRef}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.92}
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffc56d" />
            <stop offset="100%" stopColor="#ff4d1a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative z-10 px-8 text-center">
        <div className="font-sans text-5xl font-semibold tracking-tight text-gold tabular-nums">{label}</div>
        {caption ? <div className="mt-1 text-sm text-muted-foreground">{caption}</div> : null}
      </div>
    </div>
  )
}
