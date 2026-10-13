# 燃律 PulseFit

健身音乐播放器。选一轮训练，节拍会锁在做功和休息上：做功时鼓和贝斯推上去，休息时只留底。曲子在浏览器里实时生成，不播版权曲库。

应用 ID：`com.pulsefit.app`。中文名 **燃律**，英文名 **PulseFit**。同一套界面给 iOS、Android 和鸿蒙。

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

## 怎么用

- 首页按时间推荐一轮计划，也可以改成燃脂、力量、有氧、瑜伽或恢复。
- 曲库有 12 首循环。可以搜、按项目筛、收藏。
- 训练页走区间时钟。暂停会同时停音乐和计时。
- 播放页可以改 BPM 和能量。桌面宽屏时播放器停在右侧；手机上点底部迷你播放条展开。
- 记录、收藏和音量写在本机 `localStorage`（`pulsefit.v1`）。

声音要等你点一次播放，浏览器才会放行。

## 三端

现在能直接用的是这套 Web / PWA。加到主屏幕后，名字是燃律。

| 平台 | 标识 | 说明 |
| --- | --- | --- |
| iOS / Android | `com.pulsefit.app` | [`capacitor.config.json`](capacitor.config.json)，应用名燃律 |
| 鸿蒙 | `com.pulsefit.app` | [`harmony/AppScope/app.json5`](harmony/AppScope/app.json5) |
| Web | 燃律 PulseFit | `npm run dev` |

装好对应 SDK 之后，可以用 Capacitor 套上原生壳：

```bash
npx cap add ios
npx cap add android
```

鸿蒙工程用上面的 `bundleName` 和字符串资源 `燃律`。这个仓库里还没有 Xcode、Android Studio 或 DevEco 工程，因为当前环境不编译那三套原生包。
