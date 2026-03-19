import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import { Suspense } from "react";
import GlobalFeedbackFab from "@/components/global-feedback-fab";
import { PostHogProvider } from "./providers/PostHogProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DateMatch",
  description: "Campus personality matching app powered by trait analysis.",
  metadataBase: new URL("https://datematch.lol"),
  openGraph: {
    title: "DateMatch",
    description: "Campus personality matching app powered by trait analysis.",
    url: "https://datematch.lol",
    siteName: "DateMatch",
    images: [
      {
        url: "/icon.png",
        alt: "DateMatch Preview",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DateMatch",
    description: "Campus personality matching app powered by trait analysis.",
    images: ["/icon.png"],
    creator: "@imalexwang",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-lg text-gray-600">加载中...</div>
            </div>
          }
        >
          <PostHogProvider>
            {children}
            <GlobalFeedbackFab />
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
