"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Music2 } from "lucide-react"
import { applePairRequest, configureApple } from "@/lib/music/apple"
import { Button } from "@/components/ui/button"

export function ApplePairScreen() {
  const [pair, setPair] = useState<{ key: string; secret: string; code: string; token: string } | null>(null)
  const [message, setMessage] = useState("正在确认授权链接…")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const [key, secret] = window.location.hash.slice(1).split(".")
    const controller = new AbortController()
    void applePairRequest({ action: "details", key: key || "", secret: secret || "" }, controller.signal).then((data) => {
      if (controller.signal.aborted) return
      if (data.code !== 200 || !data.developerToken) throw new Error("授权链接已失效，请在原设备刷新二维码。")
      setPair({ key, secret, code: data.pairingCode || "", token: data.developerToken })
      setMessage("核对原设备上的配对码，确认后前往 Apple 官方页面授权。")
      void configureApple(data.developerToken).catch(() => {})
    }).catch((error) => { if (!controller.signal.aborted) setMessage(error.message) })
    return () => controller.abort()
  }, [])

  async function authorize() {
    if (!pair || busy) return
    setBusy(true)
    try {
      const music = await configureApple(pair.token)
      const userToken = await music.authorize()
      if (!userToken) throw new Error("授权未完成，请重试。")
      const result = await applePairRequest({ action: "complete", key: pair.key, secret: pair.secret, userToken })
      if (result.code !== 803) throw new Error(result.message || "授权链接已失效。")
      setDone(true)
      setMessage("已连接原设备，现在可以回到原设备继续听歌。")
      window.history.replaceState(null, "", window.location.pathname)
    } catch (error) { setMessage(error instanceof Error ? error.message : "授权失败，请重试。") }
    finally { setBusy(false) }
  }
  return <section className="ios-card mx-auto max-w-md p-8 text-center"><div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-[#fae5ec] text-[#dd4269]">{done ? <CheckCircle2 size={36} /> : <Music2 size={36} />}</div><h1 className="t-1">连接 Apple Music</h1><p className="my-5 text-sm leading-7 text-muted-foreground" role="status">{message}</p>{pair && !done && <><p className="mb-6 text-3xl font-semibold tracking-[.22em]" aria-label={`配对码 ${pair.code}`}>{pair.code}</p><Button className="w-full" disabled={busy} onClick={authorize}>{busy ? "正在授权…" : "确认配对并授权"}</Button><p className="mt-4 text-xs text-muted-foreground">仅连接你自己打开的燃律页面。账号密码由 Apple 官方页面处理。</p></>}</section>
}
