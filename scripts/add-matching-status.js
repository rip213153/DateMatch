import Database from "better-sqlite3";
import path from "path";

const sqlitePath = path.join(process.cwd(), "datematch.db");
const sqlite = new Database(sqlitePath);

console.log("正在添加 matching_status 和 match_at 字段...\n");

try {
  // 添加 matching_status 字段
  sqlite.exec(`
    ALTER TABLE profiles ADD COLUMN matching_status TEXT DEFAULT 'WAITING' CHECK(matching_status IN ('WAITING', 'MATCHED', 'VIEWED'))
  `);
  console.log("✓ 已添加 matching_status 字段");

  // 添加 match_at 字段
  sqlite.exec(`
    ALTER TABLE profiles ADD COLUMN match_at INTEGER
  `);
  console.log("✓ 已添加 match_at 字段");

  // 更新现有用户的状态为 MATCHED
  sqlite.exec(`UPDATE profiles SET matching_status = 'MATCHED'`);
  console.log("✓ 已更新现有用户的状态为 MATCHED");

  console.log("\n✓ 完成！数据库已更新。");
} catch (error) {
  console.error("✗ 错误:", error instanceof Error ? error.message : String(error));
} finally {
  sqlite.close();
}
