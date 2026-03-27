"use client";

import type { HomeAnnouncement } from "@/app/data/homeAnnouncement";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AnnouncementDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  announcement: HomeAnnouncement;
};

export function AnnouncementDialog({ open, onOpenChange, announcement }: AnnouncementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{announcement.title}</DialogTitle>
          <DialogDescription>
            {announcement.badge} · 更新于 {announcement.updatedAt}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="whitespace-pre-line rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm leading-6 text-slate-700">
            {announcement.summary}
          </div>

          <div className="space-y-3">
            {announcement.blocks.map((block) => (
              <section key={block.title} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <h3 className="mb-1 text-sm font-semibold text-slate-900">{block.title}</h3>
                <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{block.content}</p>
              </section>
            ))}
          </div>

          {announcement.ctaText && announcement.ctaHref ? (
            <Button asChild className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600">
              <a href={announcement.ctaHref}>{announcement.ctaText}</a>
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
