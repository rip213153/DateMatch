import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "datematch.db");
const db = new Database(dbPath);

// 查看所有数据
console.log("=== 数据库中的所有数据 ===\n");

const profiles = db.prepare("SELECT * FROM profiles").all();

if (profiles.length === 0) {
  console.log("数据库中没有数据。");
} else {
  console.log(`共找到 ${profiles.length} 条数据：\n`);
  
  for (const profile of profiles) {
    console.log(`ID: ${profile.id}`);
    console.log(`姓名: ${profile.name}`);
    console.log(`年龄: ${profile.age}`);
    console.log(`性别: ${profile.gender}`);
    console.log(`寻找: ${profile.seeking}`);
    console.log(`学校: ${profile.university}`);
    console.log(`邮箱: ${profile.email}`);
    console.log(`Instagram: ${profile.instagram || "无"}`);
    console.log(`兴趣爱好: ${profile.interests}`);
    console.log(`理想约会: ${profile.ideal_date}`);
    console.log(`人格档案: ${profile.personality_profile}`);
    console.log(`创建时间: ${profile.created_at}`);
    console.log("---");
  }
}

db.close();
