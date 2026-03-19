import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "datematch.db");
const db = new Database(dbPath);

// 添加bio字段
try {
  db.prepare("ALTER TABLE profiles ADD COLUMN bio TEXT").run();
  console.log("✅ 成功添加bio字段！");
} catch (error) {
  if (error.message.includes("already exists")) {
    console.log("bio字段已存在");
  } else {
    console.error("添加bio字段失败:", error.message);
  }
}

// 查询所有用户
const users = db.prepare("SELECT id, name, email, bio, ideal_date FROM profiles").all();

console.log("\n用户数据：");
users.forEach((user) => {
  console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
  console.log(`  Bio: ${user.bio || '(空)'}`);
  console.log(`  Ideal Date: ${user.ideal_date || '(空)'}`);
});

db.close();
