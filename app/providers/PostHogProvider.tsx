"use client";

import { PostHogProvider as Provider } from "posthog-js/react";

const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!apiKey) {
    return <>{children}</>;
  }

  return (
    <Provider
      apiKey={apiKey}
      options={{
        api_host: apiHost,
        capture_pageview: false,
      }}
    >
      {children}
    </Provider>
  );
}
