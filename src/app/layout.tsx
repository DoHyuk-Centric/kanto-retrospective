import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanto Retrospective — 개발 회고 아카이브",
  description:
    "필리핀 생활 플랫폼 Kanto를 만들며 팀이 겪은 기능구현·문제해결·성능개선·AI 활용 기록",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-black/5 py-8 text-center text-xs text-foreground/50 dark:border-white/10">
          Kanto 팀 개발 회고 아카이브 ·{" "}
          <Link href="/setup" className="hover:text-teal hover:underline">
            팀원이신가요? MCP로 콘텐츠 편집하는 방법
          </Link>
        </footer>
      </body>
    </html>
  );
}
