# 燃律 PulseFit

训练用的音乐和组数记录。中文名 **燃律**，英文名 **PulseFit**，应用 ID `com.pulsefit.app`。

本地节拍在浏览器里合成，会跟着间歇的做功和休息变。训练日和歌单按动作类型、强度和 BPM 排。训记按组记录重量，并在当天结束时画出练到的部位。

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://127.0.0.1:41731](http://127.0.0.1:41731)。

```bash
npm test
npm run lint
```

## 图像

卡片和封面用的是健身房、器械和专辑气质的照片，上面压了一层深色渐变，字才能读清。来源和许可在 [public/photos/ATTRIBUTION.md](public/photos/ATTRIBUTION.md)。本地曲子的封面是这些开放图片，不是商业专辑。

首页封面墙不把商业专辑图打进仓库。没登录、或登录后还没导入带封面的歌单时，页面请求 `/api/charts`。这条路由读取 iTunes 公开 RSS `https://itunes.apple.com/us/rss/topalbums/limit=24/json`，只把 `*.mzstatic.com` 上的封面地址交给浏览器，并改写成 300×300。封面只展示，不在燃律里播放。登录网易云、QQ 音乐或 Apple Music 并同步歌单之后，封面墙改用该账号返回的 https 封面地址，存在本机 `pulsefit.wall.v1`，按本机播放次数从高到低排。退出账号后，这个音源的封面不再出现，墙回到公开榜。

动作图标是仓库里自己画的人体剪影：椭圆形空白头部，没有五官，也不是真人照片。生成脚本是 `scripts/build-exercise-figures.mjs`。看过 Everkinetic（CC BY-SA，线稿带五官）和 free-exercise-db（维护者没有为照片授予可核验的许可），这两套都没有放进仓库。

肌肉图用的是 [react-native-body-highlighter](https://github.com/HichamELBSI/react-native-body-highlighter) 的解剖轮廓（MIT，Copyright (c) 2022 ELABBASSI Hicham）。正面和背面分开上色，头部没有五官。许可全文在 [src/lib/trainlog/ANATOMY.md](src/lib/trainlog/ANATOMY.md)。

## 界面

- 首页先是封面墙和歌单（黑胶、波形、BPM），下面仍是训练日、动作和间歇。底部是玻璃标签栏，正在播放时上面还有一条迷你播放器。
- 搜索页先给出训练日色块。选了音源再搜歌。
- 每个训练日和动作页有自己的颜色。歌单默认按类型、强度和 BPM 推荐，也可以增删，或恢复自动推荐。
- 点迷你播放器进入全屏正在播放：大封面跟着拍子发光，旁边有 BPM、组数和拍号。歌词按时间滚动高亮。本地曲子的 BPM 和能量可以改。流媒体按原曲播放。
- 训记记正式组、热身和组间有氧。哑铃写成 `(左+右)kg × 次数`。结束后给出容量、估算热量、时长、正反面肌肉图，并可下载分享卡片。
- 动作库带内置计划和 48 个动作，每个动作有自己的 SVG。也可以加自定义计划和动作。
- 间歇训练还在「间歇」里。收藏、音量和间歇历史在「我的」。

## 音源：什么是真的能用

| 音源 | 这里验证过的 | 要你自己准备的 | 限制 |
| --- | --- | --- | --- |
| 本地节拍 | 浏览器里能播、能暂停、能跟间歇 | 无 | 不是版权曲库，是 PulseEngine 合成的循环 |
| 网易云音乐 | 客户端按 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 的二维码、歌单、搜索、`/song/url/v1`、歌词接口写好了 | 你自己运行这个 API，默认 `http://127.0.0.1:3000` | 官方没有把完整播放开放给这个网页。未登录或非会员经常只有试听，甚至没有链接。本仓库不带 cookie |
| QQ 音乐 | 客户端按 [jsososo/QQMusicApi](https://github.com/jsososo/QQMusicApi) 的 `setCookie`、搜索、歌单、`/song/urls`、歌词接口写好了 | 你自己运行这个服务，默认 `http://127.0.0.1:3300`，并粘贴你自己的 y.qq.com cookie | 这份 API 没有二维码登录。不要粘贴网上或 Issue 里的 cookie。会员曲没有会员 cookie 时经常没有地址 |
| Apple Music | MusicKit JS 的配置、授权、搜索、资料库和 `setQueue` 已接上 | 你自己的 developer token，环境变量 `NEXT_PUBLIC_APPLE_MUSIC_TOKEN` 或在「音源」里填写 | 燃律不提供 token。没有订阅时通常只有试听。播放走 Apple 的播放器，不能把受保护文件下载下来 |

网页开发时，本机 API 如果被浏览器 CORS 拦住，会改走 `/api/music-proxy`。代理只允许 `http://127.0.0.1`、`http://localhost` 和公网 `https`，并且不跟随跳转。静态外壳和鸿蒙 WebView 会直接请求你配置的地址，没有这条 Next 路由。

可选环境变量：`NEXT_PUBLIC_NETEASE_API`、`NEXT_PUBLIC_QQ_API`、`NEXT_PUBLIC_APPLE_MUSIC_TOKEN`。

这次没有对着正在运行的网易云、QQ 音乐或 Apple Music 账号做登录和播放验证。没有这些服务时，播放会停在明确的错误上，本地节拍仍然可用。

## 训记怎么算

- 容量只算正式组。杠铃和器械是 `kg × 次数`。哑铃是 `(左 + 右) × 次数`。热身和组间有氧不计入容量。
- 热量是估算：`容量 × 0.004 + 组间有氧秒 × 0.12 + 分钟 × 3.2`。这不是医学测量。
- 记录在本机：`pulsefit.v1` 是收藏和间歇，`pulsefit.music.v1` 是音源设置，`pulsefit.focus.v1` 是歌单，`pulsefit.train.v1` 是训记，`pulsefit.wall.v1` 是已导入歌单的封面地址和本机播放次数。

## Android

已生成 Capacitor 工程，应用 ID `com.pulsefit.app`，显示名燃律。

在这台环境里用 Android SDK 36 跑过：

```bash
cd android
# local.properties 里写 sdk.dir=/你的/Android/Sdk
./gradlew assembleDebug
```

结果是 `BUILD SUCCESSFUL`。调试包在 `android/app/build/outputs/apk/debug/app-debug.apk`（构建产物不进 git）。

连到正在跑的网页而不是 `www/` 里的占位页：

```bash
CAP_SERVER_URL=http://10.0.2.2:41731 npx cap sync android
```

模拟器访问宿主机的 Next 用 `10.0.2.2`。真机改成电脑的局域网地址。`http` 地址会打开 cleartext。

## iOS

`ios/` 是 Capacitor 生成的 Xcode 工程，bundle id `com.pulsefit.app`，显示名燃律。这台 Linux 环境没有 Xcode，**没有编译 iOS**。

```bash
CAP_SERVER_URL=http://127.0.0.1:41731 npx cap sync ios
npx cap open ios
```

然后在 Xcode 里签名并运行。

## 鸿蒙

`harmony/` 是 Stage 模型的 ArkTS 工程，`bundleName` 为 `com.pulsefit.app`。入口页用 ArkWeb 打开燃律，默认 `http://127.0.0.1:41731`，页面上可以改地址。

这台环境没有 DevEco Studio，**没有编译鸿蒙包**。在 DevEco Studio 中打开 `harmony/`，按向导补签名后运行到模拟器或真机。模拟器要能访问你填写的燃律地址，并已在 `module.json5` 里申请 `ohos.permission.INTERNET`。

## 这次实际验证了什么

- 单元测试：歌词、音源地址白名单、网易云/QQ 响应解析、训练日推荐、容量和分享卡片。
- `npm run lint` 和 `tsc --noEmit`。
- 开发服务器 `http://127.0.0.1:41731`。
- Android `./gradlew assembleDebug` 成功。
- iOS 工程已生成，未编译。
- 鸿蒙工程已生成，未编译。
- 网易云、QQ 音乐、Apple Music 的真实登录和播放未在此环境验证。
