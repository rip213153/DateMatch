"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HomeBackgroundEffects } from "@/components/home/background-effects";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { ModeSelectionDialog } from "@/components/home/mode-selection-dialog";

export default function Home() {
  const router = useRouter();
  const [isModeDialogOpen, setIsModeDialogOpen] = useState(false);

  useEffect(() => {
    [
      "/quiz?mode=romance",
      "/quiz?mode=friendship",
      "/login?redirect=%2Fdev-channel-2&mode=romance",
      "/login?redirect=%2Fdev-channel-2%3Fmode%3Dfriendship&mode=friendship",
    ].forEach((target) => {
      router.prefetch(target);
    });
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-8">
      <HomeBackgroundEffects />
      <HomeHeroSection onStartTest={() => setIsModeDialogOpen(true)} />
      <ModeSelectionDialog open={isModeDialogOpen} onOpenChange={setIsModeDialogOpen} />
    </main>
  );
}
