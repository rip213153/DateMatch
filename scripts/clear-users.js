import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "datematch.db");
const db = new Database(dbPath);

console.log("正在清空数据库中的用户数据...\n");

try {
  // 删除所有用户数据
  db.prepare("DELETE FROM profiles").run();
  console.log("✓ 已删除所有用户数据");

  console.log("\n✓ 完成！数据库用户数据已清空。");
} catch (error) {
  console.error("✗ 错误:", error instanceof Error ? error.message : String(error));
} finally {
  db.close();
}
