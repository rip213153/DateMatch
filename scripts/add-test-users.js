import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "datematch.db");
const db = new Database(dbPath);

console.log("正在添加测试用户数据...\n");

try {
  // 添加测试用户
  const testUsers = [
    {
      name: "小美",
      age: 21,
      gender: "female",
      seeking: "male",
      university: "清华大学",
      email: "xiaomei@example.com",
      interests: JSON.stringify(["阅读", "旅行", "咖啡"]),
      ideal_date: "在咖啡馆聊天，然后去公园散步",
      bio: "喜欢阅读和旅行，期待一次浪漫的约会",
      personality_profile: JSON.stringify({
        socialStyle: 7,
        emotionalReadiness: 8,
        dateStyle: 6,
        commitment: 7,
        communication: 8,
        independence: 6,
        career: 7,
        flexibility: 7,
      }),
    },
    {
      name: "小明",
      age: 22,
      gender: "male",
      seeking: "female",
      university: "北京大学",
      email: "xiaoming@example.com",
      interests: JSON.stringify(["篮球", "音乐", "电影"]),
      ideal_date: "一起看电影，然后去吃火锅",
      bio: "喜欢运动和音乐，性格开朗",
      personality_profile: JSON.stringify({
        socialStyle: 8,
        emotionalReadiness: 7,
        dateStyle: 5,
        commitment: 6,
        communication: 8,
        independence: 7,
        career: 6,
        flexibility: 8,
      }),
    },
    {
      name: "小丽",
      age: 20,
      gender: "female",
      seeking: "male",
      university: "中国人民大学",
      email: "xiaoli@example.com",
      interests: JSON.stringify(["绘画", "美食", "摄影"]),
      ideal_date: "去艺术展览，然后尝试新餐厅",
      bio: "喜欢艺术和美食，期待有共同话题的约会",
      personality_profile: JSON.stringify({
        socialStyle: 6,
        emotionalReadiness: 7,
        dateStyle: 7,
        commitment: 8,
        communication: 7,
        independence: 8,
        career: 6,
        flexibility: 7,
      }),
    },
    {
      name: "小强",
      age: 23,
      gender: "male",
      seeking: "female",
      university: "北京师范大学",
      email: "xiaoqiang@example.com",
      interests: JSON.stringify(["编程", "游戏", "健身"]),
      ideal_date: "一起打游戏，然后去健身房",
      bio: "喜欢科技和游戏，认真负责",
      personality_profile: JSON.stringify({
        socialStyle: 5,
        emotionalReadiness: 6,
        dateStyle: 4,
        commitment: 8,
        communication: 6,
        independence: 8,
        career: 8,
        flexibility: 5,
      }),
    },
    {
      name: "小雪",
      age: 21,
      gender: "female",
      seeking: "male",
      university: "北京外国语大学",
      email: "xiaoxue@example.com",
      interests: JSON.stringify(["语言", "文化", "旅游"]),
      ideal_date: "去博物馆，然后尝试异国餐厅",
      bio: "喜欢语言和文化，期待跨文化的交流",
      personality_profile: JSON.stringify({
        socialStyle: 8,
        emotionalReadiness: 6,
        dateStyle: 6,
        commitment: 7,
        communication: 9,
        independence: 7,
        career: 5,
        flexibility: 8,
      }),
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO profiles (name, age, gender, seeking, university, email, interests, ideal_date, bio, personality_profile, matching_status, match_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'WAITING', NULL, CURRENT_TIMESTAMP)
  `);

  for (const user of testUsers) {
    stmt.run(
      user.name,
      user.age,
      user.gender,
      user.seeking,
      user.university,
      user.email,
      user.interests,
      user.ideal_date,
      user.bio,
      user.personality_profile
    );
  }

  console.log(`✓ 已添加 ${testUsers.length} 个测试用户\n`);

  // 查看所有用户
  const profiles = db.prepare("SELECT id, name, email FROM profiles").all();
  console.log(`数据库中共有 ${profiles.length} 个用户：\n`);
  for (const profile of profiles) {
    console.log(`ID: ${profile.id}, 姓名: ${profile.name}, 邮箱: ${profile.email}`);
  }

  console.log("\n✓ 完成！");
} catch (error) {
  console.error("✗ 错误:", error instanceof Error ? error.message : String(error));
} finally {
  db.close();
}
