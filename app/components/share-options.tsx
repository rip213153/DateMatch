"use client";

import { motion } from "framer-motion";
import { Twitter, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareOptionsProps {
  score: number;
  title: string;
  message: string;
}

export function ShareOptions({ score, title, message }: ShareOptionsProps) {
  const shareText = `I scored ${score}% on the "Will You Stay Single Forever?" quiz and got "${title}"! ${message}`;
  const shareUrl = "https://datematch.lol";

  const shareLinks = [
    {
      name: "Twitter",
      icon: <Twitter className="w-4 h-4" />,
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
      },
    },
    {
      name: "Product Hunt",
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => {
        window.open(
          `https://www.producthunt.com/posts/new?url=${encodeURIComponent(
            shareUrl
          )}&name=Will+You+Stay+Single+Forever?&tagline=${encodeURIComponent(
            "Find out your single score this Valentine's"
          )}`,
          "_blank"
        );
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-4"
    >
      {/* {shareLinks.map((link, index) => ( */}
      {shareLinks.map((link) => (
        <Button
          key={link.name}
          variant="outline"
          onClick={link.action}
          className="flex items-center justify-center gap-2"
        >
          {link.icon}
          {link.name}
        </Button>
      ))}
    </motion.div>
  );
}
