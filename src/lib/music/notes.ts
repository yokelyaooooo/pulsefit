export const PROVIDER_NOTES = {
  local: {
    title: "本地节拍",
    works: "浏览器里就能响。燃律用 PulseEngine 按 BPM 实时合成，不播放版权录音。",
    limit: "这不是网易云、QQ 音乐或 Apple Music 的曲库。",
  },
  netease: {
    title: "网易云音乐",
    works:
      "使用内置连接扫码登录，支持个人歌单、搜索、播放和歌词。也可在连接设置中使用自己的兼容服务。",
    limit:
      "歌曲播放范围由登录账号、会员权益、版权和所在地区决定。",
  },
  qq: {
    title: "QQ 音乐",
    works:
      "使用手机 QQ 扫码连接个人账号，支持歌单同步、搜索、播放和歌词。",
    limit:
      "需要在手机 QQ 上确认音乐授权；播放范围由平台和账号权益决定。",
  },
  apple: {
    title: "Apple Music",
    works:
      "使用官方 MusicKit JS。填入你自己的 developer token 后可以授权、搜索资料库和歌单，并由 Apple 的播放器播歌。",
    limit:
      "Token 只能在你的 Apple Developer 账号里生成，燃律不附带 token。没有 Apple Music 订阅时，通常只能听试听。播放不经过我们的音频引擎，也不能把受保护的文件下载下来。",
  },
} as const
