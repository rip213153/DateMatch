import type { Metadata } from "next";
import type React from "react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "DateMatch 结果",
  description: "查看你的 DateMatch 测试结果与人格分析。",
  openGraph: {
    title: "DateMatch 结果",
    description: "查看你的 DateMatch 测试结果与人格分析。",
    images: [
      {
        url: "/icon.png",
        alt: "DateMatch 结果预览",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DateMatch 结果",
    description: "查看你的 DateMatch 测试结果与人格分析。",
    images: ["/icon.png"],
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg text-gray-600">加载中...</div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
