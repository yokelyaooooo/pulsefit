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

## 界面与训练记录

- 应用 Logo 使用用户提供的机器人图片，Web 图标、PWA、iOS、Android 和鸿蒙图标已同步。页面采用蓝紫粉配色和半透明玻璃材质。
- 音乐首页采用 Apple Music 式编辑精选、方形封面和横向专辑轨；流行专辑会自动缓慢滚动，悬停、触摸或手动滚动时暂停。桌面侧栏与手机底部导航分别适配，底部 Dock 和迷你播放器固定在视口并留出安全区。
- 资料库支持搜索、类型筛选、收藏、顺序/随机播放；音乐搜索保留本地、网易云、QQ 音乐和 Apple Music 的现有连接能力。
- 正在播放包含封面、进度、音量、收藏、随机播放、列表/单曲循环、歌词及可点选待播清单；歌词滚动区使用窄型半透明滚动条。本地节拍还能调节 BPM 和能量。
- 训练支持内置/自定义计划、自定义动作、肌群/器械筛选、动作排序、正式/热身/递减/有氧组、左右哑铃负重、完成勾选、超级组标记、备注、实时保存和组间休息计时。
- 再次训练自动带入上次重量与次数，同时清空完成状态；未完成训练可刷新恢复。
- 历史页包含月历、容量趋势、训练详情、日期/时长/组数修改、复制训练、删除和 JSON 数据导出；动作详情可查看最高负重及近期记录。
- 训练总结参考用户截图：可切换并记住男性或女性解剖轮廓，按训练动作高亮真实肌肉区域，同时展示容量、估算消耗、时长和完整组数；可导出 PNG 训练卡，不支持画布的环境提供 SVG。
- 训练数据保存在当前设备，新增字段兼容旧记录。未实现训记的账号云同步、社区、付费内容及 Apple Watch/HealthKit 服务，也未连接训记服务器。

参考：[Apple 音乐操作指南](https://support.apple.com/zh-cn/guide/iphone/iph4b506b24d/ios)、[训记功能说明](https://apps.apple.com/cn/app/id1464915553)。

## 音源：什么是真的能用

| 音源 | 这里验证过的 | 要你自己准备的 | 限制 |
| --- | --- | --- | --- |
| 本地节拍 | 浏览器里能播、能暂停、能跟间歇 | 无 | 不是版权曲库，是 PulseEngine 合成的循环 |
| 网易云音乐 | 内置二维码创建、状态轮询、歌单、搜索、播放地址与歌词接口 | 用网易云音乐 App 扫码确认 | 播放范围由账号、会员权益、版权和地区决定；授权只保存在当前设备 |
| QQ 音乐 | 内置手机 QQ 扫码、授权状态轮询、歌单、搜索、播放地址与歌词接口 | 用手机 QQ 扫码并确认 | 会员曲需要对应账号权益；授权只保存在当前设备 |
| Apple Music | MusicKit JS 授权、搜索、资料库、歌单及 Apple 播放器；也提供跨设备扫码入口 | 你自己的 developer token；跨设备扫码还需要可由手机访问的 HTTPS 地址 | 燃律不提供 token。没有订阅时通常只有试听，受保护文件不能下载 |

网易云和 QQ 默认走同源内置接口。连接设置仍允许改用自己的兼容服务；网页开发时，如果该服务被浏览器 CORS 拦住，会改走 `/api/music-proxy`。代理只允许 `http://127.0.0.1`、`http://localhost` 和公网 `https`，并且不跟随跳转。

可选环境变量：`NEXT_PUBLIC_NETEASE_API`、`NEXT_PUBLIC_QQ_API`、`NEXT_PUBLIC_APPLE_MUSIC_TOKEN`。Apple 跨设备扫码还需要 `APP_PUBLIC_ORIGIN`，其值应为手机可以访问的 HTTPS 站点根地址。

这次验证了网易云和 QQ 的真实二维码生成、状态轮询与取消流程；完整账号授权和会员曲播放仍需要使用者亲自扫码。Apple 的完整授权仍需要有效 developer token，跨设备扫码还需要已部署的 HTTPS 地址。本地节拍始终可用。

## 训记怎么算

- 容量只算已完成的正式组和递减组；旧记录未包含完成字段时沿用原有统计。杠铃和器械是 `kg × 次数`。哑铃是 `(左 + 右) × 次数`。热身和组间有氧不计入容量。
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

## Release 产物

`v1.0.0` 发布包按平台提供：

- `PulseFit-v1.0.0-web-server.zip`：Node.js 独立 Web 服务，解压后运行 `node server.js`，默认监听 3000 端口。
- `PulseFit-v1.0.0-android-preview.apk`：使用 Android 调试签名生成的可安装预览包，适合验收，不用于应用商店发布。
- `PulseFit-v1.0.0-ios-xcode.zip`：已同步资源的 Xcode 工程，需要在 macOS 上选择开发团队后归档签名。
- `PulseFit-v1.0.0-harmony-deveco.zip`：已同步资源的 DevEco Studio 工程，需要配置鸿蒙 SDK 与签名后生成 HAP/App Pack。

移动端工程是 WebView 外壳，正式发布前请通过 `CAP_SERVER_URL` 指向已经部署的燃律 Web 服务。Apple 与鸿蒙的正式安装包必须由各自官方工具和开发者证书签名，仓库不保存签名凭据。

## iOS

`ios/` 是 Capacitor 生成的 Xcode 工程，bundle id `com.pulsefit.app`，显示名燃律。当前 Windows 构建环境没有 Xcode，**没有编译 iOS**。

```bash
CAP_SERVER_URL=http://127.0.0.1:41731 npx cap sync ios
npx cap open ios
```

然后在 Xcode 里签名并运行。

## 鸿蒙

`harmony/` 是 Stage 模型的 ArkTS 工程，`bundleName` 为 `com.pulsefit.app`。入口页用 ArkWeb 打开燃律，默认 `http://127.0.0.1:41731`，页面上可以改地址。

当前环境没有 DevEco Studio，**没有编译鸿蒙包**。在 DevEco Studio 中打开 `harmony/`，按向导补签名后运行到模拟器或真机。模拟器要能访问你填写的燃律地址，并已在 `module.json5` 里申请 `ohos.permission.INTERNET`。

## 这次实际验证了什么

- 单元测试：歌词、音源地址白名单、网易云/QQ 响应解析、训练日推荐、容量和分享卡片。
- `npm run lint` 和 `tsc --noEmit`。
- 开发服务器 `http://127.0.0.1:41731`。
- Android `./gradlew assembleDebug` 成功。
- iOS 工程已生成，未编译。
- 鸿蒙工程已生成，未编译。
- 网易云、QQ 的真实二维码生成和轮询已验证；账号确认、会员曲播放及 Apple Music 授权需要实际账号和有效 developer token，未在仓库环境中代替用户完成。

## 2026-10-14 界面重构验收

- 生产构建、TypeScript 与源代码 ESLint 检查通过。
- 覆盖播放队列循环/随机、训练新旧数据兼容、完成组容量、历史复制及上次表现的单元测试。
- 浏览器操作验证：手机/桌面页面、固定 Dock、播放/收藏/搜索、自定义动作/计划、训练保存与刷新恢复、历史编辑/再次训练和 PNG 导出。
- 本次更新各端图标资源，未重新编译原生安装包；外部音乐账号授权与完整曲目播放仍需使用实际账号验证。
