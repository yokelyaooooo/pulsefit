import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { AppShell, BootScreen } from "@/components/app-shell";
import { PlayerProvider } from "@/components/player-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "燃律 PulseFit",
  description: "燃律 PulseFit。训练日歌单、本地节拍，以及网易云、QQ 音乐和 Apple Music。训记用来记组数和部位。",
  applicationName: "燃律",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "燃律",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2f2f7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <PlayerProvider>
          <Suspense fallback={<BootScreen />}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </PlayerProvider>
      </body>
    </html>
  );
}
