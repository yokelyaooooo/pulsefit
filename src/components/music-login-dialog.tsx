"use client"

import { useEffect, useState } from "react"
import { Check, CheckCircle2, LoaderCircle, QrCode, RefreshCw, Smartphone } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlatformLogo } from "@/components/platform-logo"
import { getMusicSnapshot, updateMusic } from "@/lib/music/config"
import { neteaseAccount, neteaseQrPoll, neteaseQrStart } from "@/lib/music/netease"
import { qqQrCancel, qqQrPoll, qqQrStart } from "@/lib/music/qq"
import { appleAcceptUserToken, applePairRequest } from "@/lib/music/apple"

export type LoginProvider = "netease" | "qq" | "apple"
export const providerNames = { netease: "网易云音乐", qq: "QQ 音乐", apple: "Apple Music" }
type Phase = "loading" | "waiting" | "scanned" | "verifying" | "success" | "expired" | "error"

export function MusicLoginDialog({ provider, onClose, onConnected }: { provider: LoginProvider; onClose: () => void; onConnected: (provider: LoginProvider) => void }) {
  const [revision, setRevision] = useState(0)
  const [phase, setPhase] = useState<Phase>("loading")
  const [image, setImage] = useState("")
  const [message, setMessage] = useState("正在获取安全二维码…")
  const [remaining, setRemaining] = useState(180)
  const [pairCode, setPairCode] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    let timer: ReturnType<typeof setTimeout>, clock: ReturnType<typeof setInterval>
    let key = "", pollKey = "", deadline = 0, failures = 0
    let credential: { cookie: string; uin?: string; name?: string } | null = null
    const settings = getMusicSnapshot()
    const expired = () => { setPhase("expired"); setMessage("二维码已过期，刷新后继续登录。"); clearInterval(clock) }
    const poll = async () => {
      if (signal.aborted) return
      if (Date.now() >= deadline) { expired(); return }
      try {
        const result = provider === "apple"
          ? await applePairRequest({ action: "status", key, secret: pollKey }, signal)
          : credential ? { code: 803, ...credential, message: "正在确认账号…" }
          : provider === "qq" ? await qqQrPoll(key, signal) : await neteaseQrPoll(settings, key, signal)
        if (signal.aborted) return
        if (result.code === 800) { expired(); return }
        if (result.code === 803) {
          setPhase("verifying"); setMessage("授权已确认，正在连接账号…")
          if (provider === "apple") {
            if (!("userToken" in result) || !result.userToken || !result.developerToken) throw new Error("Apple 授权尚未返回，请重试。")
            await appleAcceptUserToken(result.developerToken, result.userToken)
            if (signal.aborted) return
            updateMusic({ appleToken: result.developerToken, appleConnected: true })
          } else {
            if (!("cookie" in result) || !result.cookie) throw new Error("平台尚未返回音乐授权，请刷新二维码。")
            credential = { cookie: result.cookie, uin: "uin" in result ? result.uin : undefined, name: "name" in result ? result.name : undefined }
            if (provider === "netease") {
              const account = await neteaseAccount({ ...settings, neteaseCookie: credential.cookie }, signal)
              if (signal.aborted) return
              updateMusic({ neteaseCookie: credential.cookie, neteaseUid: account.uid, neteaseName: account.name || "网易云用户" })
            } else {
              if (!credential.uin) throw new Error("QQ 音乐账号信息缺失，请重新扫码。")
              updateMusic({ qqBase: "/api/qq", qqCookie: credential.cookie, qqUin: credential.uin, qqName: credential.name || `QQ ${credential.uin}` })
            }
          }
          setPhase("success"); setMessage("连接成功，正在为你同步歌单。")
          clearInterval(clock)
          onConnected(provider)
          return
        }
        if (result.code !== 801 && result.code !== 802) throw new Error("平台暂未返回有效状态，正在重试…")
        failures = 0
        setPhase(result.code === 802 ? "scanned" : "waiting")
        setMessage(result.message || "等待扫码")
      } catch (error) {
        if (signal.aborted) return
        failures++
        setMessage(error instanceof Error ? error.message : "连接中断，请重试。")
        if (failures >= 3) { setPhase("error"); clearInterval(clock); return }
      }
      if (!signal.aborted) timer = setTimeout(poll, failures ? 3500 : 2000)
    }
    const start = async () => {
      setPhase("loading"); setImage(""); setPairCode(""); setMessage("正在获取安全二维码…")
      try {
        const qr = provider === "apple" ? await applePairRequest({ action: "create", developerToken: settings.appleToken }, signal)
          : provider === "qq" ? await qqQrStart(signal) : await neteaseQrStart(settings, signal)
        if (signal.aborted) return
        if (!qr.key || !qr.image) throw new Error("平台未返回二维码，请重试。")
        key = qr.key
        if ("pollKey" in qr) pollKey = qr.pollKey || ""
        if ("code" in qr) setPairCode(String(qr.code))
        setImage(qr.image)
        deadline = Date.now() + (provider === "apple" ? 300_000 : 180_000)
        setRemaining(provider === "apple" ? 300 : 180)
        setPhase("waiting")
        setMessage(provider === "qq" ? "打开手机 QQ，扫一扫后确认登录" : provider === "apple" ? "使用手机相机扫码，前往 Apple 官方页面授权" : "打开网易云音乐，扫一扫后确认登录")
        clock = setInterval(() => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))), 1000)
        timer = setTimeout(poll, 1800)
      } catch (error) {
        if (!signal.aborted) { setPhase("error"); setMessage(error instanceof Error ? error.message : "二维码获取失败，请重试。") }
      }
    }
    void start()
    return () => {
      controller.abort(); clearTimeout(timer); clearInterval(clock)
      if (key && provider === "qq") void qqQrCancel(key)
      if (key && provider === "apple") void applePairRequest({ action: "cancel", key, secret: pollKey }).catch(() => {})
    }
  }, [provider, revision, onConnected])

  const ended = phase === "expired" || phase === "error"
  return <Dialog open onOpenChange={(open) => { if (!open) onClose() }}><DialogContent className="service-login-dialog">
    <div className={`service-dialog-brand service-${provider}`}><PlatformLogo source={provider} className="size-14 rounded-2xl" /></div>
    <DialogTitle className="service-dialog-title">连接 {providerNames[provider]}</DialogTitle>
    <DialogDescription className="service-dialog-subtitle">扫码确认，让你的音乐在这里继续</DialogDescription>
    <div className={`service-qr-frame ${ended ? "is-expired" : ""}`}>
      {phase === "success" ? <div className="service-qr-success"><CheckCircle2 size={60} /><strong>已连接</strong></div> : image ? <>
        {/* Platform QR codes are generated for this one login session. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`${providerNames[provider]}登录二维码`} />
        {(ended || phase === "scanned" || phase === "verifying") && <div className="service-qr-overlay">{ended ? <QrCode size={38} /> : phase === "verifying" ? <LoaderCircle className="animate-spin" size={38} /> : <Check size={38} />}<span>{ended ? "请刷新二维码" : phase === "verifying" ? "正在连接" : "请在手机上确认"}</span></div>}
      </> : <div className="service-qr-empty">{phase === "loading" ? <LoaderCircle className="animate-spin" size={32} /> : <QrCode size={38} />}<span>{phase === "loading" ? "正在生成" : "暂时无法生成"}</span></div>}
    </div>
    <p className={`service-login-status ${ended ? "is-error" : ""}`} role="status" aria-live="polite">{message}</p>
    {pairCode && !ended && phase !== "success" && <p className="service-pair-code">配对码 <strong>{pairCode}</strong></p>}
    {!ended && phase !== "loading" && phase !== "success" && <p className="service-countdown">有效期 {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</p>}
    <div className="service-login-actions">{phase === "success" ? <Button onClick={onClose} className="w-full">完成</Button> : <><Button variant="secondary" disabled={phase === "loading" || phase === "verifying"} onClick={() => setRevision(revision + 1)}><RefreshCw size={15} />刷新二维码</Button><Button variant="ghost" onClick={onClose}>取消</Button></>}</div>
    <p className="service-dialog-note"><Smartphone size={12} />在手机上确认后，此页面会自动连接。</p>
  </DialogContent></Dialog>
}
