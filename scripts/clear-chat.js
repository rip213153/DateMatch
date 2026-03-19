import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "datematch.db");
const db = new Database(dbPath);

// 清理聊天记录
db.prepare("DELETE FROM chat_messages").run();

console.log("✅ 所有聊天记录已清理！");
console.log(`📍 数据库文件位置: ${dbPath}`);

db.close();
