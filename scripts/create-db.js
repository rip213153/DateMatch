import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "datematch.db");
const db = new Database(dbPath);

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    seeking TEXT NOT NULL,
    university TEXT NOT NULL,
    email TEXT NOT NULL,
    instagram TEXT,
    interests TEXT,
    ideal_date TEXT NOT NULL,
    personality_profile TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("✅ 数据库和表创建成功！");
console.log(`📍 数据库文件位置: ${dbPath}`);

db.close();
