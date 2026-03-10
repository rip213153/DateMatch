"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type FeedbackItem = {
  id: number;
  source: string;
  nickname: string;
  content: string;
  createdAt: string;
};

function getSourceLabel(pathname: string): string {
  if (pathname === "/") return "\u9996\u9875";
  if (pathname === "/results") return "\u6d4b\u8bc4\u7ed3\u679c\u9875";
  if (pathname === "/find-matches") return "\u5339\u914d\u7ed3\u679c\u9875";
  if (pathname === "/dev-channel-2") return "\u5f00\u53d1\u4e2d\u63a7\u53f0";
  return pathname || "unknown";
}

export default function GlobalFeedbackFab() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const sourceLabel = useMemo(() => getSourceLabel(pathname), [pathname]);

  if (pathname === "/feedback" || pathname === "/chat") return null;

  const handleSubmit = async () => {
    const clean = content.trim();
    if (!clean) return;

    const item: FeedbackItem = {
      id: Date.now(),
      source: pathname || "/",
      nickname: nickname.trim() || "\u533f\u540d",
      content: clean,
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem("datematch_feedback_items");
      const list = raw ? (JSON.parse(raw) as FeedbackItem[]) : [];
      const next = [item, ...list].slice(0, 300);
      localStorage.setItem("datematch_feedback_items", JSON.stringify(next));
    } catch (error) {
      console.error("save feedback failed", error);
    }

    setSubmitted(true);
    setContent("");
    
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: pathname || "/",
          nickname: nickname.trim() || "匿名",
          content: clean,
        }),
      });
    } catch (error) {
      console.error("send feedback failed:", error);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="fixed bottom-24 right-4 z-40 h-11 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 text-white shadow-lg hover:from-pink-600 hover:to-purple-700 sm:bottom-6 sm:right-5"
        >
          <MessageCircle className="h-4 w-4" />
          {"\u53cd\u9988"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{"\u53cd\u9988"}</DialogTitle>
          <DialogDescription>{`\u5f53\u524d\u6765\u6e90\uff1a${sourceLabel}`}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={"\u79f0\u547c\uff08\u9009\u586b\uff09"}
          />
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (submitted) setSubmitted(false);
            }}
            placeholder={"\u8bf7\u8f93\u5165\u4f60\u7684\u5efa\u8bae\uff0c\u6bd4\u5982\uff1a\u5361\u7247\u5e03\u5c40\u5df2\u7ecf\u5f88\u597d\uff0c\u5e0c\u671b\u8d44\u6599\u9875\u518d\u8865\u5145\u66f4\u591a\u7b5b\u9009\u6761\u4ef6\u3002"}
            className="min-h-[130px]"
          />
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
          >
            <Send className="h-4 w-4" />
            {"\u63d0\u4ea4\u53cd\u9988"}
          </Button>
          {submitted ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {"\u5df2\u63d0\u4ea4\uff0c\u611f\u8c22\u53cd\u9988\u3002"}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}