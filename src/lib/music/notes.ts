export const PROVIDER_NOTES = {
  local: {
    title: "本地节拍",
    works: "浏览器里就能响。燃律用 PulseEngine 按 BPM 实时合成，不播放版权录音。",
    limit: "这不是网易云、QQ 音乐或 Apple Music 的曲库。",
  },
  netease: {
    title: "网易云音乐",
    works:
      "对接你自己运行的 NeteaseCloudMusicApi（GitHub: Binaryify/NeteaseCloudMusicApi）。支持二维码登录、歌单、搜索、播放地址和歌词。",
    limit:
      "网易云没有对这个网页开放官方播放接口。不填写并运行你自己的 API 时，登录和曲库同步不会发生。未登录或非会员经常只能拿到试听，甚至拿不到链接。",
  },
  qq: {
    title: "QQ 音乐",
    works:
      "对接你自己运行的 QQMusicApi（GitHub: jsososo/QQMusicApi）。把你自己的 y.qq.com cookie 交给这个本地服务后，可以搜索、同步歌单、取播放地址和歌词。",
    limit:
      "这份 API 没有二维码登录。不要粘贴仓库、Issue 或别人机器上的 cookie。会员歌曲没有会员 cookie 时经常没有播放地址。",
  },
  apple: {
    title: "Apple Music",
    works:
      "使用官方 MusicKit JS。填入你自己的 developer token 后可以授权、搜索资料库和歌单，并由 Apple 的播放器播歌。",
    limit:
      "Token 只能在你的 Apple Developer 账号里生成，燃律不附带 token。没有 Apple Music 订阅时，通常只能听试听。播放不经过我们的音频引擎，也不能把受保护的文件下载下来。",
  },
} as const
