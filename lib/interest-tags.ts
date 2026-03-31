export const INTEREST_TAG_LIMIT = 7;

function normalizeInterestValue(value: unknown) {
  return String(value ?? "").trim();
}

export function parseInterestValues(value: unknown) {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[\n,\/\uFF0C\u3001;\uFF1B|]+/)
      : [];

  const normalizedValues = rawValues
    .map((item) => normalizeInterestValue(item))
    .filter(Boolean);

  return Array.from(new Set(normalizedValues));
}

export function normalizeInterestValues(value: unknown, maxCount: number = INTEREST_TAG_LIMIT) {
  return parseInterestValues(value).slice(0, maxCount);
}

export function serializeInterestValues(value: unknown, maxCount: number = INTEREST_TAG_LIMIT) {
  return normalizeInterestValues(value, maxCount).join(", ");
}
