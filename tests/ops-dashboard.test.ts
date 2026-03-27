import assert from "node:assert/strict";
import test from "node:test";
import { filterOpsFeedbackItems, normalizeOpsFeedbackFilter, type OpsFeedbackItem } from "../lib/ops-feedback.ts";

const SAMPLE_ITEMS: OpsFeedbackItem[] = [
  {
    id: "1",
    submittedAt: "2026-03-26T12:00:00.000Z",
    source: "home",
    nickname: "Alice",
    content: "Need more matching transparency",
    status: "received",
    emailId: null,
    error: null,
  },
  {
    id: "2",
    submittedAt: "2026-03-26T13:00:00.000Z",
    source: "chat",
    nickname: "Bob",
    content: "Email delivery failed for me",
    status: "failed",
    emailId: "mail_123",
    error: "SMTP timeout",
  },
  {
    id: "3",
    submittedAt: "2026-03-26T14:00:00.000Z",
    source: "home-banner",
    nickname: "Carol",
    content: "Announcement looked great",
    status: "sent",
    emailId: "mail_456",
    error: null,
  },
];

test("normalizeOpsFeedbackFilter trims input and treats all as empty status", () => {
  const normalized = normalizeOpsFeedbackFilter({
    status: "  ALL  ",
    source: " Home ",
    query: "  Alice ",
  });

  assert.deepEqual(normalized, {
    status: "",
    source: "home",
    query: "alice",
  });
});

test("filterOpsFeedbackItems filters by status, source and keyword together", () => {
  const result = filterOpsFeedbackItems(SAMPLE_ITEMS, {
    status: "failed",
    source: "chat",
    query: "delivery",
  });

  assert.equal(result.length, 1);
  assert.equal(result[0]?.id, "2");
});

test("filterOpsFeedbackItems matches keyword against nickname, source and content", () => {
  assert.equal(filterOpsFeedbackItems(SAMPLE_ITEMS, { query: "carol" }).length, 1);
  assert.equal(filterOpsFeedbackItems(SAMPLE_ITEMS, { query: "home-banner" }).length, 1);
  assert.equal(filterOpsFeedbackItems(SAMPLE_ITEMS, { query: "transparency" }).length, 1);
});

