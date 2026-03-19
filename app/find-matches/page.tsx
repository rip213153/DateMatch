import { redirect } from "next/navigation";

type FindMatchesRedirectPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function toSearchParams(input: Record<string, string | string[] | undefined> | undefined) {
  const params = new URLSearchParams();

  if (!input) return params;

  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  return params;
}

export default function FindMatchesRedirectPage({ searchParams }: FindMatchesRedirectPageProps) {
  const params = toSearchParams(searchParams);
  const query = params.toString();
  redirect(query ? `/dev-channel-2?${query}` : "/dev-channel-2");
}