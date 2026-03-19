"use client";

import type { QuizMode } from "@/app/data/types";
import { INTEREST_TAG_LIBRARY } from "@/app/data/interestTagLibrary";
import { CategorizedTagEditor } from "@/components/profile/CategorizedTagEditor";

export function mergeInterestInputs(selectedTags: string[], description: string) {
  const merged = [...selectedTags, ...description.split(/[\n,，、/]+/).map((item) => item.trim()).filter(Boolean)];
  return Array.from(new Set(merged.map((item) => item.trim()).filter(Boolean))).slice(0, 7);
}

type InterestTagEditorProps = {
  mode: QuizMode;
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
};

export function InterestTagEditor({
  mode,
  selectedTags,
  onSelectedTagsChange,
  description,
  onDescriptionChange,
}: InterestTagEditorProps) {
  return (
    <CategorizedTagEditor
      mode={mode}
      groups={INTEREST_TAG_LIBRARY}
      selectedTags={selectedTags}
      onSelectedTagsChange={onSelectedTagsChange}
      description={description}
      onDescriptionChange={onDescriptionChange}
      helperText="先从不同的大类里挑选更贴近你的兴趣标签，也可以在下方补充自己的兴趣。"
      placeholder="补充你的兴趣，用逗号、顿号或换行分隔，例如：播客、脱口秀、逛书店。"
      descriptionLabel="补充兴趣（选填）"
      selectedCountLabel="已选兴趣"
      emptySelectedText="建议至少选择 1 个兴趣标签，方便更快遇到同频的人。"
      descriptionHint="已选标签和补充兴趣会合并去重后一起参与匹配。"
      maxTags={20}
      mergeDescriptionAsTags={true}
    />
  );
}


