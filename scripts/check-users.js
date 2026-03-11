import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "datematch.db");
const db = new Database(dbPath);

// 查询所有用户
const users = db.prepare("SELECT id, name, email, bio, ideal_date FROM profiles").all();

console.log("用户数据：");
users.forEach((user) => {
  console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
  console.log(`  Bio: ${user.bio || '(空)'}`);
  console.log(`  Ideal Date: ${user.ideal_date || '(空)'}`);
});

db.close();
