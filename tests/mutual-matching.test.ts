import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("mutual matching keeps the Top 3 cap for reciprocal recommendations", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "lib", "mutual-matching.ts"), "utf8");

  assert.match(source, /export const MUTUAL_MATCH_LIMIT = 3;/);
});
