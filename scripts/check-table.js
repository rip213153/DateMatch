import Database from "better-sqlite3";
import path from "path";

const sqlitePath = path.join(process.cwd(), "datematch.db");
const sqlite = new Database(sqlitePath);

console.log("检查 profiles 表结构...\n");

try {
  const columns = sqlite.prepare("PRAGMA table_info(profiles)").all();
  console.log("表结构:");
  columns.forEach((col) => {
    console.log(`  ${col.name} (${col.type}) - ${col.notnull ? "NOT NULL" : "NULL"}${col.dflt_value ? " DEFAULT " + col.dflt_value : ""}`);
  });
} catch (error) {
  console.error("✗ 错误:", error instanceof Error ? error.message : String(error));
} finally {
  sqlite.close();
}
