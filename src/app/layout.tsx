import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { AppShell, BootScreen } from "@/components/app-shell";
import { PlayerProvider } from "@/components/player-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "燃律 PulseFit",
  description: "燃律 PulseFit。训练日歌单、本地节拍，以及网易云、QQ 音乐和 Apple Music。训记用来记组数和部位。",
  applicationName: "燃律",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "燃律",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        <PlayerProvider>
          <Suspense fallback={<BootScreen />}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </PlayerProvider>
      </body>
    </html>
  );
}
