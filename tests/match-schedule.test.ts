import assert from "node:assert/strict";
import test from "node:test";
import {
  DISPLAY_DAYS,
  getEligibleReleaseAt,
  getMatchSchedule,
  isOptedOutForRound,
  MATCH_DAY,
  MATCH_HOUR,
  MATCH_MINUTE,
} from "../lib/match-schedule.ts";

test("schedule enters display window after weekly release", () => {
  const now = new Date("2026-03-28T12:00:00+08:00");
  const schedule = getMatchSchedule(now);

  assert.equal(schedule.phase, "display_window");
  assert.equal(schedule.isInDisplayWindow, true);
  assert.equal(new Date(schedule.releaseAt).toISOString(), "2026-03-27T10:00:00.000Z");
  assert.equal(new Date(schedule.displayEndAt).toISOString(), "2026-04-01T10:00:00.000Z");
  assert.equal(DISPLAY_DAYS, 5);
});

test("schedule stays before release after previous display window ends", () => {
  const now = new Date("2026-03-27T09:00:00+08:00");
  const schedule = getMatchSchedule(now);

  assert.equal(schedule.phase, "before_release");
  assert.equal(schedule.isInDisplayWindow, false);
  assert.equal(new Date(schedule.releaseAt).toISOString(), "2026-03-27T10:00:00.000Z");
  assert.equal(new Date(schedule.countdownTargetAt).toISOString(), "2026-03-27T10:00:00.000Z");
});

test("schedule moves to between_windows after display period closes", () => {
  const now = new Date("2026-04-02T12:00:00+08:00");
  const schedule = getMatchSchedule(now);

  assert.equal(schedule.phase, "between_windows");
  assert.equal(schedule.isInDisplayWindow, false);
  assert.equal(new Date(schedule.releaseAt).toISOString(), "2026-04-03T10:00:00.000Z");
  assert.equal(new Date(schedule.nextReleaseAt).toISOString(), "2026-04-03T10:00:00.000Z");
});

test("eligible release shifts to next round during display window", () => {
  const now = new Date("2026-03-30T20:30:00+08:00");
  const eligibleReleaseAt = getEligibleReleaseAt(now);

  assert.equal(new Date(eligibleReleaseAt).toISOString(), "2026-04-03T10:00:00.000Z");
});

test("eligible release stays in current round before release opens", () => {
  const now = new Date("2026-03-27T12:00:00+08:00");
  const eligibleReleaseAt = getEligibleReleaseAt(now);

  assert.equal(new Date(eligibleReleaseAt).toISOString(), "2026-03-27T10:00:00.000Z");
});

test("opt-out flag only blocks users until the configured round cutoff", () => {
  const now = new Date("2026-03-30T20:30:00+08:00");
  const futureOptOut = new Date("2026-04-03T10:00:00.000Z");
  const expiredOptOut = new Date("2026-03-27T10:00:00.000Z");

  assert.equal(isOptedOutForRound(futureOptOut, now), true);
  assert.equal(isOptedOutForRound(futureOptOut.getTime(), now), true);
  assert.equal(isOptedOutForRound(expiredOptOut, now), false);
  assert.equal(isOptedOutForRound(null, now), false);
});

test("schedule constants keep Friday 18:00 CST release semantics", () => {
  assert.equal(MATCH_DAY, 5);
  assert.equal(MATCH_HOUR, 18);
  assert.equal(MATCH_MINUTE, 0);
});
