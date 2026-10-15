"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { AudioLines, CalendarDays, ChevronRight, Dumbbell, Headphones, House, Library, ListMusic, Search, Timer, UserRound } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { MiniPlayer } from "@/components/mini-player"
import { NowPlaying } from "@/components/now-playing"
import { usePlayer } from "@/components/player-provider"
import { ThemeBridge } from "@/components/theme-bridge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatClock } from "@/lib/audio/clock"

const nav = [
  { href: "/", label: "现在就听", icon: House },
  { href: "/library", label: "资料库", icon: Library },
  { href: "/train", label: "训练", icon: Dumbbell },
  { href: "/search", label: "搜索", icon: Search },
]
const trainingNav = [
  { href: "/train", label: "训练记录", icon: Dumbbell },
  { href: "/train/history", label: "训练日历", icon: CalendarDays },
  { href: "/train/library", label: "动作与计划", icon: ListMusic },
  { href: "/session", label: "间歇计时", icon: Timer },
]

export function BootScreen() {
  return <div className="boot-screen"><BrandMark className="size-20" /><div className="t-1 mt-5">燃律</div><p className="t-caption mt-2 text-muted-foreground">音乐与训练，同频发生。</p></div>
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const player = usePlayer()
  const [open, setOpen] = useState(false)
  const isTraining = pathname.startsWith("/train") || pathname === "/session"
  const routeLabel = [...nav, ...trainingNav, { href: "/sources", label: "音乐服务" }, { href: "/me", label: "我的" }].find((item) => item.href === pathname)?.label ?? "精选歌单"

  return (
    <div className="app-frame" data-section={isTraining ? "training" : "music"}>
      <ThemeBridge />
      <a className="skip-link" href="#main-content">跳转到主要内容</a>
      <aside className="app-sidebar">
        <Link href="/" className="brand-lockup"><BrandMark className="size-12" /><span><strong>燃律<span className="brand-dot">.</span></strong><small>PulseFit</small></span></Link>
        <Link href="/search" className="sidebar-search"><Search size={16} />搜索音乐、训练</Link>
        <p className="sidebar-label">音乐</p>
        <nav aria-label="音乐导航" className="sidebar-nav">
          {nav.filter((item) => item.href !== "/train" && item.href !== "/search").map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}><Icon size={19} /><span>{label}</span></Link>)}
          <Link href="/sources" aria-current={pathname === "/sources" ? "page" : undefined}><AudioLines size={19} /><span>音乐服务</span></Link>
        </nav>
        <p className="sidebar-label mt-7">你的训练</p>
        <nav aria-label="训练导航" className="sidebar-nav training-sidebar-nav">
          {trainingNav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}><Icon size={19} /><span>{label}</span></Link>)}
        </nav>
        <div className="sidebar-bottom"><div className="sidebar-note"><Headphones size={20} /><p>找到节奏。<br /><span>让每一次进步，都有回响。</span></p></div><Link href="/me" className="sidebar-profile"><span className="profile-icon"><UserRound size={19} /></span><span>我的空间<small>收藏 · 偏好设置</small></span><ChevronRight size={15} /></Link></div>
      </aside>

      <div className="app-workspace">
        <header className="app-topbar">
          <Link href="/" className="mobile-brand"><BrandMark className="size-9" /><span>燃律</span></Link>
          <div className="desktop-breadcrumb"><span>{isTraining ? "你的训练" : "PulseFit"}</span><ChevronRight size={12} /><strong>{routeLabel}</strong></div>
          <div className="topbar-actions"><Link href="/session" aria-label="间歇计时" title="间歇计时"><Timer size={18} /></Link><Link href="/sources" aria-label="音乐服务" title="音乐服务"><AudioLines size={18} /></Link><Link href="/me" aria-label="我的空间" className="topbar-avatar"><UserRound size={18} /></Link></div>
        </header>
        <main id="main-content" className="app-content">
          {player.error ? <div className="ios-card mb-4 px-4 py-3 text-sm text-red-600" role="alert">{player.error}</div> : null}
          {player.notice ? <div className="ios-card mb-4 flex items-start justify-between gap-3 px-4 py-3 text-sm" role="status"><p>{player.notice}</p><button type="button" className="ios-link shrink-0" onClick={player.dismissNotice}>知道了</button></div> : null}
          {children}
        </main>
      </div>

      <div className="app-dock-position" data-testid="fixed-dock">
        <div className="app-dock-stack">
          <MiniPlayer onOpen={() => setOpen(true)} />
          <nav className="liquid-glass app-dock" aria-label="底部导航">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
              return <Link key={href} href={href} className={active ? "dock-link is-active" : "dock-link"} aria-current={active ? "page" : undefined}><Icon size={22} strokeWidth={active ? 2.3 : 1.8} /><span>{label}</span></Link>
            })}
          </nav>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="player-dialog" showCloseButton={false} onCloseAutoFocus={(event) => { event.preventDefault(); document.querySelector<HTMLButtonElement>('[data-testid="fixed-dock"] button')?.focus() }}>
          <DialogTitle className="sr-only">正在播放</DialogTitle>
          <DialogDescription className="sr-only">音乐播放控制、歌词与待播列表</DialogDescription>
          <NowPlaying onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(player.summary)} onOpenChange={(value) => !value && player.dismissSummary()}>
        <DialogContent><DialogHeader><DialogTitle className="t-3">{player.summary?.finished ? "这轮练完了" : "训练已记下"}</DialogTitle><DialogDescription>{player.summary ? `${player.summary.planName} · ${formatClock(player.summary.durationSec)} · ${player.summary.bpm} BPM` : ""}</DialogDescription></DialogHeader><p className="t-sub">{player.summary?.finished ? "间歇训练已保存到「我的空间」。继续记录力量训练，可以前往「训练」。" : "本次训练的时长已保存，可在「我的空间」查看。"}</p><DialogFooter><Button onClick={player.dismissSummary}>完成</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  )
}
