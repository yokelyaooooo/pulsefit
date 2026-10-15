import { useId } from "react"

export function PlatformLogo({ source, className = "" }: { source: "netease" | "qq" | "apple"; className?: string }) {
  const id = useId().replace(/:/g, "")
  return <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs><linearGradient id={id} x2="0" y2="1"><stop stopColor={source === "qq" ? "#54dba0" : source === "apple" ? "#fa718c" : "#fb6472"} /><stop offset="1" stopColor={source === "qq" ? "#22b98c" : source === "apple" ? "#eb3d68" : "#e94054"} /></linearGradient></defs>
    <rect width="64" height="64" rx="18" fill={`url(#${id})`} />
    {source === "netease" ? <path d="M39 14c-6 2-9 7-7 12 2 5 9 7 11 2 2-5-3-9-9-9-10 0-18 7-18 17 0 10 9 17 18 15 8-1 13-7 13-14 0-7-5-12-12-12-6 0-10 3-10 8 0 5 5 8 9 6 3-1 4-4 3-6" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /> : source === "qq" ? <><path d="M32 14 48 25 32 36Z" fill="#ffde70" /><path d="M32 18v25c0 6-4 10-9 10-5 0-9-3-9-7s4-7 9-7c2 0 4 .5 5 1V16Z" fill="white" /><path d="M40 37c4-4 4-9 2-12" stroke="#eaffec" strokeWidth="3" fill="none" strokeLinecap="round" /></> : <path d="M26 23v22c0 5-5 8-9 7-5-1-5-7-1-9 2-2 5-2 7-2V18l25-5v27c0 5-5 8-9 7-5-1-5-7-1-9 2-2 5-2 7-2V22Z" fill="white" />}
  </svg>
}
