import Database from "better-sqlite3";
import path from "path";

const sqlitePath = path.join(process.cwd(), "datematch.db");
const sqlite = new Database(sqlitePath);

console.log("正在更新现有用户的状态...\n");

try {
  // 更新现有用户的状态为 MATCHED
  sqlite.exec(`UPDATE profiles SET matching_status = 'MATCHED'`);
  console.log("✓ 已更新现有用户的状态为 MATCHED");

  console.log("\n✓ 完成！");
} catch (error) {
  console.error("✗ 错误:", error instanceof Error ? error.message : String(error));
} finally {
  sqlite.close();
}
