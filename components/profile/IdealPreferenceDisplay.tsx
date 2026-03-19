import type { QuizMode } from "@/app/data/types";
import { normalizeIdealPreferenceTags } from "@/app/data/idealPreferenceTags";
import { Badge } from "@/components/ui/badge";

type IdealPreferenceDisplayProps = {
  mode: QuizMode;
  tags: unknown;
  description: string | null | undefined;
  emptyText?: string;
};

export function IdealPreferenceDisplay({
  mode,
  tags,
  description,
  emptyText = "暂未填写",
}: IdealPreferenceDisplayProps) {
  const normalizedTags = normalizeIdealPreferenceTags(tags);
  const text = String(description ?? "").trim();
  const badgeClassName =
    mode === "friendship"
      ? "border-transparent bg-sky-100 text-sky-700 hover:bg-sky-100"
      : "border-transparent bg-pink-100 text-pink-700 hover:bg-pink-100";

  if (normalizedTags.length === 0 && !text) {
    return <div className="leading-relaxed text-gray-800">{emptyText}</div>;
  }

  return (
    <div className="space-y-3">
      {normalizedTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {normalizedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className={badgeClassName}>
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
      {text ? <div className="whitespace-pre-wrap leading-relaxed text-gray-800">{text}</div> : null}
    </div>
  );
}
