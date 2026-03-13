import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "datematch (1).db");
const db = new Database(dbPath);

console.log("=== datematch (1).db 数据库内容 ===\n");

try {
  // 查看所有表
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("数据库中的表：");
  for (const table of tables) {
    console.log(`  - ${table.name}`);
  }
  
  console.log("\n=== email_login_tokens 表 ===");
  try {
    const tokens = db.prepare("SELECT * FROM email_login_tokens LIMIT 5").all();
    console.log(`共 ${tokens.length} 条记录`);
    for (const token of tokens) {
      console.log(`  ID: ${token.id}, Email: ${token.email}, Expires: ${new Date(token.expires_at * 1000).toISOString()}`);
    }
  } catch (e) {
    console.log("  无数据或表不存在");
  }
  
  console.log("\n=== match_confirmations 表 ===");
  try {
    const confirmations = db.prepare("SELECT * FROM match_confirmations LIMIT 5").all();
    console.log(`共 ${confirmations.length} 条记录`);
    for (const conf of confirmations) {
      console.log(`  User: ${conf.user_id}, Target: ${conf.target_user_id}, Confirmed: ${new Date(conf.confirmed_at * 1000).toISOString()}`);
    }
  } catch (e) {
    console.log("  无数据或表不存在");
  }
  
  console.log("\n=== chat_messages 表 ===");
  try {
    const messages = db.prepare("SELECT * FROM chat_messages LIMIT 5").all();
    console.log(`共 ${messages.length} 条记录`);
    for (const msg of messages) {
      console.log(`  From: ${msg.sender_id}, To: ${msg.receiver_id}, Content: ${msg.content.substring(0, 30)}...`);
    }
  } catch (e) {
    console.log("  无数据或表不存在");
  }
  
  console.log("\n=== sqlite_sequence 表 ===");
  try {
    const sequence = db.prepare("SELECT * FROM sqlite_sequence").all();
    console.log(`共 ${sequence.length} 条记录`);
    for (const seq of sequence) {
      console.log(`  ${seq.name}: ${seq.seq}`);
    }
  } catch (e) {
    console.log("  无数据或表不存在");
  }
  
} catch (error) {
  console.error("错误:", error.message);
} finally {
  db.close();
}
