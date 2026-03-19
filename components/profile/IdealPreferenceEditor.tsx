"use client";

import type { QuizMode } from "@/app/data/types";
import {
  getIdealPreferenceGroups,
  getIdealPreferenceHelperText,
  getIdealPreferenceMaxTags,
  getIdealPreferencePlaceholder,
} from "@/app/data/idealPreferenceTags";
import { CategorizedTagEditor } from "@/components/profile/CategorizedTagEditor";

type IdealPreferenceEditorProps = {
  mode: QuizMode;
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
};

export function IdealPreferenceEditor({
  mode,
  selectedTags,
  onSelectedTagsChange,
  description,
  onDescriptionChange,
}: IdealPreferenceEditorProps) {
  return (
    <CategorizedTagEditor
      mode={mode}
      groups={getIdealPreferenceGroups(mode)}
      selectedTags={selectedTags}
      onSelectedTagsChange={onSelectedTagsChange}
      description={description}
      onDescriptionChange={onDescriptionChange}
      helperText={getIdealPreferenceHelperText(mode)}
      placeholder={getIdealPreferencePlaceholder(mode)}
      descriptionLabel="补充描述（选填）"
      selectedCountLabel="已选标签"
      emptySelectedText="建议至少选择 1 个标签，方便更快遇到同频的人。"
      descriptionHint="标签用于匹配，补充描述会展示在资料页里，帮助对方更快理解你。"
      maxTags={getIdealPreferenceMaxTags()}
      mergeDescriptionAsTags={false}
    />
  );
}

