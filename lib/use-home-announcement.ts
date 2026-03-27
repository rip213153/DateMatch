"use client";

import { useEffect, useState } from "react";
import { homeAnnouncement as defaultAnnouncement, type HomeAnnouncement } from "@/app/data/homeAnnouncement";

type HomeAnnouncementState = {
  announcement: HomeAnnouncement;
  source: "default" | "override";
  warning: string | null;
  loading: boolean;
};

export function useHomeAnnouncement(enabled: boolean = true): HomeAnnouncementState {
  const [state, setState] = useState<HomeAnnouncementState>({
    announcement: defaultAnnouncement,
    source: "default",
    warning: null,
    loading: enabled,
  });

  useEffect(() => {
    if (!enabled) {
      setState((current) => ({
        ...current,
        loading: false,
      }));
      return;
    }

    let cancelled = false;

    fetch("/api/home-announcement", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as {
          announcement?: HomeAnnouncement;
          source?: "default" | "override";
          warning?: string | null;
        };

        if (!response.ok || !data.announcement) {
          throw new Error("load announcement failed");
        }

        if (cancelled) return;

        setState({
          announcement: data.announcement,
          source: data.source === "override" ? "override" : "default",
          warning: data.warning ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (cancelled) return;

        setState({
          announcement: defaultAnnouncement,
          source: "default",
          warning: null,
          loading: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}
