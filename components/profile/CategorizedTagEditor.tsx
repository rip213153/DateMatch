"use client";

import { useMemo, useState } from "react";
import type { QuizMode } from "@/app/data/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCcw } from "lucide-react";

export type CategorizedTagGroup = {
  id: string;
  label: string;
  description: string;
  tags: string[];
};

type CategorizedTagEditorProps = {
  mode: QuizMode;
  groups: CategorizedTagGroup[];
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  helperText: string;
  placeholder: string;
  descriptionLabel: string;
  selectedCountLabel: string;
  emptySelectedText: string;
  descriptionHint: string;
  maxTags: number;
  batchSize?: number;
  mergeDescriptionAsTags?: boolean;
};

function parseDescription(value: string) {
  return value
    .split(/[\n,，、/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTagList(tags: string[]) {
  return Array.from(new Set(tags.map((item) => item.trim()).filter(Boolean)));
}

export function mergeCategorizedInputs(selectedTags: string[], description: string, mergeDescriptionAsTags: boolean, maxTags: number) {
  if (!mergeDescriptionAsTags) {
    return selectedTags.slice(0, maxTags);
  }

  const merged = [...selectedTags, ...parseDescription(description)];
  return Array.from(new Set(merged.map((item) => item.trim()).filter(Boolean))).slice(0, maxTags);
}

function rotateList<T>(items: T[], offset: number) {
  if (items.length === 0) return [];
  const normalizedOffset = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
}

export function CategorizedTagEditor({
  mode,
  groups,
  selectedTags,
  onSelectedTagsChange,
  description,
  onDescriptionChange,
  helperText,
  placeholder,
  descriptionLabel,
  selectedCountLabel,
  emptySelectedText,
  descriptionHint,
  maxTags,
  batchSize = 12,
  mergeDescriptionAsTags = false,
}: CategorizedTagEditorProps) {
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? "");
  const [offset, setOffset] = useState(0);

  const theme =
    mode === "friendship"
      ? {
          categoryActiveClassName: "border-sky-300 bg-sky-50 text-sky-700 shadow-[0_0_15px_rgba(14,165,233,0.12)]",
          categoryClassName: "border-transparent bg-[#f8fafc] text-gray-500 hover:bg-sky-50/60 hover:text-sky-600",
          panelClassName: "border-sky-100 bg-sky-50/40",
          headingClassName: "text-sky-700",
          activeTagClassName: "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-500/20",
          tagClassName: "border border-gray-200 bg-white text-gray-600 hover:border-sky-300 hover:text-sky-600",
          selectedClassName: "bg-sky-100 text-sky-700",
          textareaClassName:
            "h-28 resize-none rounded-xl border-transparent bg-[#f8fafc] focus:border-sky-300 focus:ring-4 focus:ring-sky-500/10",
          helperClassName: "text-sky-700/80",
          shuffleButtonClassName: "rounded-full border-sky-200 text-sky-600 hover:bg-sky-50",
        }
      : {
          categoryActiveClassName: "border-purple-300 bg-purple-50 text-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.12)]",
          categoryClassName: "border-transparent bg-[#f8f9fa] text-gray-500 hover:bg-purple-50/50 hover:text-purple-600",
          panelClassName: "border-pink-100 bg-pink-50/40",
          headingClassName: "text-pink-700",
          activeTagClassName: "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20",
          tagClassName: "border border-gray-200 bg-white text-gray-600 hover:border-pink-300 hover:text-pink-600",
          selectedClassName: "bg-pink-100 text-pink-700",
          textareaClassName:
            "h-28 resize-none rounded-xl border-transparent bg-[#f8f9fa] focus:border-purple-300 focus:ring-4 focus:ring-purple-500/10",
          helperClassName: "text-pink-700/80",
          shuffleButtonClassName: "rounded-full border-pink-200 text-pink-600 hover:bg-pink-50",
        };

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null,
    [groups, selectedGroupId],
  );

  const visibleTags = useMemo(
    () => rotateList(selectedGroup?.tags ?? [], offset).slice(0, batchSize),
    [batchSize, offset, selectedGroup],
  );

  const mergedDisplayTags = useMemo(
    () => mergeCategorizedInputs(selectedTags, description, mergeDescriptionAsTags, maxTags),
    [description, maxTags, mergeDescriptionAsTags, selectedTags],
  );
  const mergedRawTags = useMemo(
    () =>
      mergeDescriptionAsTags
        ? normalizeTagList([...selectedTags, ...parseDescription(description)])
        : normalizeTagList(selectedTags),
    [description, mergeDescriptionAsTags, selectedTags],
  );

  const toggleTag = (tag: string) => {
    const isActive = selectedTags.includes(tag);
    if (isActive) {
      onSelectedTagsChange(selectedTags.filter((item) => item !== tag));
      return;
    }

    const limitReached = mergeDescriptionAsTags
      ? mergedRawTags.length >= maxTags && !mergedRawTags.includes(tag)
      : selectedTags.length >= maxTags;

    if (limitReached) {
      return;
    }

    onSelectedTagsChange([...selectedTags, tag]);
  };

  return (
    <div className="space-y-4">
      <p className={`text-sm ${theme.helperClassName}`}>{helperText}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {groups.map((group) => {
          const isActive = group.id === selectedGroup?.id;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => {
                setSelectedGroupId(group.id);
                setOffset(0);
              }}
              className={`relative flex min-h-[72px] items-center justify-center rounded-2xl border-2 px-4 py-4 text-sm font-semibold transition-all duration-300 active:scale-[0.97] ${
                isActive ? theme.categoryActiveClassName : theme.categoryClassName
              }`}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      {selectedGroup ? (
        <div className={`rounded-2xl border p-4 ${theme.panelClassName}`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className={`text-sm font-semibold ${theme.headingClassName}`}>{selectedGroup.label}</div>
              <div className="mt-1 text-xs text-gray-500">{selectedGroup.description}</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOffset((current) => current + batchSize)}
              className={theme.shuffleButtonClassName}
            >
              <RefreshCcw className="mr-1 h-3.5 w-3.5" /> 换一批
            </Button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {visibleTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              const isDisabled = !isActive
                ? mergeDescriptionAsTags
                  ? mergedRawTags.length >= maxTags && !mergedRawTags.includes(tag)
                  : selectedTags.length >= maxTags
                : false;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  disabled={isDisabled}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? theme.activeTagClassName : theme.tagClassName
                  } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-gray-500">
            {selectedCountLabel} {mergedDisplayTags.length}/{maxTags}
          </div>
          {selectedTags.length > 0 || description.trim() ? (
            <button
              type="button"
              onClick={() => {
                onSelectedTagsChange([]);
                onDescriptionChange("");
              }}
              className="text-xs font-medium text-gray-400 transition hover:text-gray-600"
            >
              清空
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {mergedDisplayTags.length > 0 ? (
            mergedDisplayTags.map((tag) => {
              const isSelectedTag = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (isSelectedTag) {
                      toggleTag(tag);
                    }
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${theme.selectedClassName} ${
                    isSelectedTag ? "" : "cursor-default opacity-80"
                  }`}
                >
                  {tag}
                  {isSelectedTag ? " ×" : ""}
                </button>
              );
            })
          ) : (
            <div className="text-xs text-gray-400">{emptySelectedText}</div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">{descriptionLabel}</label>
        <Textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className={theme.textareaClassName}
          placeholder={placeholder}
        />
        <p className="text-xs text-gray-400">{descriptionHint}</p>
      </div>
    </div>
  );
}
