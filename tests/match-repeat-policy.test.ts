import assert from "node:assert/strict";
import test from "node:test";
import {
  MATCH_REPEAT_COOLDOWN_DAYS,
  MATCH_REPEAT_COOLDOWN_MS,
  buildMatchPairKey,
  getMatchRepeatWindowStart,
  isMatchPairCoolingDown,
} from "../lib/match-repeat-policy.ts";

test("match repeat cooldown keeps a two week window", () => {
  assert.equal(MATCH_REPEAT_COOLDOWN_DAYS, 14);
  assert.equal(MATCH_REPEAT_COOLDOWN_MS, 14 * 24 * 60 * 60 * 1000);
});

test("match repeat policy normalizes pair keys regardless of order", () => {
  assert.equal(buildMatchPairKey(3, 9), "3:9");
  assert.equal(buildMatchPairKey(9, 3), "3:9");
});

test("match repeat window starts fourteen days before now", () => {
  const now = new Date("2026-04-05T12:00:00.000Z");
  assert.equal(getMatchRepeatWindowStart(now).toISOString(), "2026-03-22T12:00:00.000Z");
});

test("match repeat cooling check only blocks pairs seen within the cooldown window", () => {
  const coolingDownPairKeys = new Set(["3:9"]);

  assert.equal(isMatchPairCoolingDown(3, 9, coolingDownPairKeys), true);
  assert.equal(isMatchPairCoolingDown(9, 3, coolingDownPairKeys), true);
  assert.equal(isMatchPairCoolingDown(3, 10, coolingDownPairKeys), false);
});
