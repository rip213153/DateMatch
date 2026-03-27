import type { QuizMode } from "@/app/data/types";

export type ProfileChoiceField = "gender" | "seeking";

export type ProfileChoiceOption = {
  value: string;
  label: string;
};

const LEGACY_VALUE_LABELS: Record<string, string> = {
  male: "\u7537\u751f",
  female: "\u5973\u751f",
  "non-binary": "\u975e\u4e8c\u5143",
  other: "\u5176\u4ed6",
  any: "\u90fd\u53ef\u4ee5",
};

const PROFILE_CHOICE_OPTIONS: Record<QuizMode, Record<ProfileChoiceField, ProfileChoiceOption[]>> = {
  romance: {
    gender: [
      { value: "male", label: "\u7537" },
      { value: "female", label: "\u5973" },
      { value: "non-binary", label: "\u975e\u4e8c\u5143" },
      { value: "other", label: "\u5176\u4ed6" },
    ],
    seeking: [
      { value: "male", label: "\u7537" },
      { value: "female", label: "\u5973" },
      { value: "non-binary", label: "\u975e\u4e8c\u5143" },
      { value: "any", label: "\u90fd\u53ef\u4ee5" },
    ],
  },
  friendship: {
    gender: [
      { value: "male", label: "\u7537\u751f" },
      { value: "female", label: "\u5973\u751f" },
      { value: "any", label: "\u90fd\u53ef\u4ee5" },
    ],
    seeking: [
      { value: "male", label: "\u7537\u751f" },
      { value: "female", label: "\u5973\u751f" },
      { value: "any", label: "\u90fd\u53ef\u4ee5" },
    ],
  },
};

export function getProfileChoiceOptions(mode: QuizMode, field: ProfileChoiceField) {
  return PROFILE_CHOICE_OPTIONS[mode][field];
}

export function isProfileChoiceAllowed(mode: QuizMode, field: ProfileChoiceField, value: string) {
  return getProfileChoiceOptions(mode, field).some((option) => option.value === value);
}

export function getProfileChoiceOptionsWithLegacy(mode: QuizMode, field: ProfileChoiceField, currentValue: string) {
  const options = getProfileChoiceOptions(mode, field);

  if (!currentValue || isProfileChoiceAllowed(mode, field, currentValue)) {
    return options;
  }

  return [
    ...options,
    {
      value: currentValue,
      label: `\u65e7\u7248\uff1a${LEGACY_VALUE_LABELS[currentValue] ?? currentValue}`,
    },
  ];
}
