"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.back()}
      className={`
        fixed top-1 left-4 z-50 flex items-center justify-center
        w-9 h-9 rounded-full
        bg-white/70 backdrop-blur-md border border-white/60
        shadow-[0_4px_12px_rgba(236,72,153,0.15)]
        text-pink-600 hover:text-pink-700
        transition-all duration-300
        ${className}
      `}
      aria-label="返回"
    >
      <ArrowLeft className="w-4 h-4" />
    </motion.button>
  );
}
