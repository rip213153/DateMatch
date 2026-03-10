import { Suspense } from "react";

export default function QuizLayout({
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
