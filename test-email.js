import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "datematch.db");
const db = new Database(dbPath);

console.log("=== 手动触发邮件发送测试 ===\n");

try {
  var users = db.prepare("SELECT id, name, email FROM profiles").all();
  console.log("找到 " + users.length + " 个用户\n");
  
  for (const user of users) {
    console.log("处理用户: " + user.name + " (" + user.email + ")");
    
    if (user.email_sent_at) {
      console.log("  邮件已发送，跳过");
    } else {
      console.log("  邮件未发送，准备发送...");
      
      // 模拟获取匹配数量
      var stmt = db.prepare("SELECT COUNT(*) as count FROM match_confirmations WHERE user_id = ? OR target_user_id = ?");
      var matches = stmt.all(user.id, user.id);
      var matchCount = matches.length > 0 ? matches[0].count : 0;
      
      console.log("  匹配数量: " + matchCount);
      
      if (matchCount > 0) {
        console.log("  ✅ 应该发送邮件");
      } else {
        console.log("  ⚠️  没有匹配，不发送邮件");
      }
    }
    console.log("");
  }
} catch (error) {
  console.error("错误:", error.message);
} finally {
  db.close();
}
