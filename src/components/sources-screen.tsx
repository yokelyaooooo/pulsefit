"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { appleAuthorize, appleLibrary, appleSearch } from "@/lib/music/apple"
import {
  getMusicSnapshot,
  getServerMusicSnapshot,
  hydrateMusic,
  subscribeMusic,
  updateMusic,
} from "@/lib/music/config"
import { neteaseAccount, neteasePlaylists, neteaseQrPoll, neteaseQrStart } from "@/lib/music/netease"
import { PROVIDER_NOTES } from "@/lib/music/notes"
import { describeQqCookie, qqConnect, qqPlaylists } from "@/lib/music/qq"
import type { PlaylistItem } from "@/lib/music/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePlayer } from "@/components/player-provider"
import { rememberCatalog } from "@/lib/music/local"
import { tracksForPlaylist } from "@/lib/music/resolve"

export function SourcesScreen() {
  const settings = useSyncExternalStore(subscribeMusic, getMusicSnapshot, getServerMusicSnapshot)
  const player = usePlayer()
  const [message, setMessage] = useState("")
  const [qr, setQr] = useState<{ key: string; image: string | null; url: string | null } | null>(null)
  const [lists, setLists] = useState<PlaylistItem[]>([])
  const [tracksNote, setTracksNote] = useState("")

  useEffect(() => {
    queueMicrotask(hydrateMusic)
  }, [])

  useEffect(() => {
    if (!qr?.key) return
    const key = qr.key
    const timer = window.setInterval(() => {
      void neteaseQrPoll(getMusicSnapshot(), key)
        .then(async (result) => {
          setMessage(result.message)
          if (result.code === 800) setQr(null)
          if (result.code === 803 && result.cookie) {
            updateMusic({ neteaseCookie: result.cookie })
            const account = await neteaseAccount({ ...getMusicSnapshot(), neteaseCookie: result.cookie })
            updateMusic({ neteaseCookie: result.cookie, neteaseUid: account.uid, neteaseName: account.name })
            setMessage(account.name ? `已登录 ${account.name}` : "网易云已登录")
            setQr(null)
          }
        })
        .catch((caught: unknown) => setMessage(caught instanceof Error ? caught.message : "扫码状态读取失败"))
    }, 2000)
    return () => window.clearInterval(timer)
  }, [qr?.key])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight">音源</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          本地节拍随时能响。网易云、QQ 音乐和 Apple Music 都要用你自己的接口或开发者 token，燃律不代登、也不保存别人的 cookie。
        </p>
      </header>
      {message ? <p className="rounded-2xl bg-white/8 px-3 py-2 text-sm">{message}</p> : null}

      <SourceCard title={PROVIDER_NOTES.local.title} works={PROVIDER_NOTES.local.works} limit={PROVIDER_NOTES.local.limit}>
        <p className="text-sm text-muted-foreground">状态：可用。不需要登录。</p>
      </SourceCard>

      <SourceCard title={PROVIDER_NOTES.netease.title} works={PROVIDER_NOTES.netease.works} limit={PROVIDER_NOTES.netease.limit}>
        <label className="block text-xs text-muted-foreground">
          API 地址
          <Input
            className="mt-1"
            value={settings.neteaseBase}
            onChange={(event) => updateMusic({ neteaseBase: event.target.value })}
            aria-label="网易云 API 地址"
          />
        </label>
        <p className="text-sm">{settings.neteaseName ? `已登录 ${settings.neteaseName}` : "还没登录"}</p>
        {qr?.image ? (
          // The QR image is a data URL returned by the user's own NetEase API.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr.image} alt="网易云登录二维码" className="w-40 rounded-xl bg-white p-2" />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              setMessage("正在向你的网易云 API 要二维码。")
              void neteaseQrStart(getMusicSnapshot())
                .then((next) => {
                  setQr(next)
                  setMessage("用网易云 App 扫码。")
                })
                .catch((caught: unknown) => setMessage(caught instanceof Error ? caught.message : "二维码失败"))
            }}
          >
            扫码登录
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void neteasePlaylists(getMusicSnapshot())
                .then((items) => {
                  setLists(items)
                  setMessage(items.length ? `同步了 ${items.length} 个歌单` : "这个账号没有返回歌单")
                })
                .catch((caught: unknown) => setMessage(caught instanceof Error ? caught.message : "歌单同步失败"))
            }}
          >
            同步歌单
          </Button>
          <Button type="button" variant="ghost" onClick={() => updateMusic({ neteaseCookie: "", neteaseUid: "", neteaseName: "" })}>
            退出
          </Button>
        </div>
      </SourceCard>

      <SourceCard title={PROVIDER_NOTES.qq.title} works={PROVIDER_NOTES.qq.works} limit={PROVIDER_NOTES.qq.limit}>
        <label className="block text-xs text-muted-foreground">
          API 地址
          <Input
            className="mt-1"
            value={settings.qqBase}
            onChange={(event) => updateMusic({ qqBase: event.target.value })}
            aria-label="QQ 音乐 API 地址"
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          你自己的 cookie
          <textarea
            className="mt-1 min-h-24 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm"
            value={settings.qqCookie}
            onChange={(event) => updateMusic({ qqCookie: event.target.value, qqUin: describeQqCookie(event.target.value).uin || settings.qqUin })}
            aria-label="QQ 音乐 cookie"
            placeholder="从你已登录的 y.qq.com 复制，不要用网上的"
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          QQ 号（cookie 里没有 uin 时填写）
          <Input className="mt-1" value={settings.qqUin} onChange={(event) => updateMusic({ qqUin: event.target.value })} aria-label="QQ 号" />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              void qqConnect(getMusicSnapshot())
                .then((identity) => {
                  updateMusic({ qqUin: identity.uin, qqName: identity.name })
                  setMessage(`QQ 音乐已收下 cookie：${identity.name}`)
                })
                .catch((caught: unknown) => setMessage(caught instanceof Error ? caught.message : "QQ 音乐连接失败"))
            }}
          >
            保存并连接
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void qqPlaylists(getMusicSnapshot())
                .then((items) => {
                  setLists(items)
                  setMessage(items.length ? `同步了 ${items.length} 个歌单` : "没有返回歌单")
                })
                .catch((caught: unknown) => setMessage(caught instanceof Error ? caught.message : "歌单同步失败"))
            }}
          >
            同步歌单
          </Button>
        </div>
      </SourceCard>

      <SourceCard title={PROVIDER_NOTES.apple.title} works={PROVIDER_NOTES.apple.works} limit={PROVIDER_NOTES.apple.limit}>
        <label className="block text-xs text-muted-foreground">
          Developer token
          <Input
            className="mt-1"
            value={settings.appleToken}
            onChange={(event) => updateMusic({ appleToken: event.target.value })}
            aria-label="Apple developer token"
            placeholder="MusicKit developer token"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              void appleAuthorize(getMusicSnapshot().appleToken)
                .then(() => setMessage("Apple Music 已授权"))
                .catch((caught: unknown) => setMessage(caught instanceof Error ? caught.message : "Apple Music 授权失败"))
            }}
          >
            授权
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void appleLibrary(getMusicSnapshot().appleToken)
                .then((items) => {
                  setLists(items)
                  setMessage(items.length ? `资料库里有 ${items.length} 个播放列表` : "资料库没有返回播放列表")
                })
                .catch((caught: unknown) => setMessage(caught instanceof Error ? caught.message : "资料库读取失败"))
            }}
          >
            同步资料库
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              void appleSearch(getMusicSnapshot().appleToken, "workout")
                .then((items) => {
                  rememberCatalog(items)
                  setTracksNote(items.length ? `搜到 ${items.length} 首，去搜索页用 Apple 筛选也能找到。` : "Apple 没有返回歌曲")
                  if (items[0]) void player.playTrack(items[0].id, { queue: items.map((item) => item.id) })
                })
                .catch((caught: unknown) => setMessage(caught instanceof Error ? caught.message : "Apple 搜索失败"))
            }}
          >
            试搜 workout 并播放
          </Button>
        </div>
      </SourceCard>

      {lists.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">歌单</h2>
          <ul className="space-y-2">
            {lists.map((list) => (
              <li key={list.id}>
                <button
                  type="button"
                  className="w-full rounded-2xl bg-white/5 px-3 py-3 text-left"
                  onClick={() => {
                    void tracksForPlaylist(list.source, list.nativeId, getMusicSnapshot())
                      .then((items) => {
                        rememberCatalog(items)
                        setTracksNote(items.length ? `${list.name}：${items.length} 首，点第一首开始。` : `${list.name} 没有解析出歌曲`)
                        if (items[0]) void player.playTrack(items[0].id, { queue: items.map((item) => item.id) })
                      })
                      .catch((caught: unknown) => setMessage(caught instanceof Error ? caught.message : "歌曲读取失败"))
                  }}
                >
                  <span className="font-medium">{list.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {list.source} {list.trackCount != null ? `· ${list.trackCount} 首` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {tracksNote ? <p className="text-sm text-muted-foreground">{tracksNote}</p> : null}
        </section>
      ) : null}
    </div>
  )
}

function SourceCard({
  title,
  works,
  limit,
  children,
}: {
  title: string
  works: string
  limit: string
  children: React.ReactNode
}) {
  return (
    <section className="glass space-y-3 rounded-3xl p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm leading-6">{works}</p>
      <p className="text-sm leading-6 text-muted-foreground">{limit}</p>
      {children}
    </section>
  )
}
