import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { AppStoreProvider } from "@/components/providers/app-store";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PwaRegister } from "@/components/providers/pwa-register";

export const metadata: Metadata = { title: { default: "목포 워터세이프", template: "%s | 목포 워터세이프" }, description: "목포시 수인성 질병 위험 대응 지도 · 가상 데이터 해커톤 시연", applicationName: "Mokpo WaterSafe" };
export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#0e7490" }, { media: "(prefers-color-scheme: dark)", color: "#083344" }], width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" suppressHydrationWarning><body><a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-white focus:p-3">본문으로 건너뛰기</a><ThemeProvider><AppStoreProvider><PwaRegister /><AppShell>{children}</AppShell></AppStoreProvider></ThemeProvider></body></html>;
}
