import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "datematch.db");
const db = new Database(dbPath);

// 查询当前登录用户的邮箱
const authIdentity = localStorage.getItem("datematch_auth_identity");
console.log("authIdentity:", authIdentity);

// 查询用户数据
const email = authIdentity?.startsWith("email:") ? authIdentity?.substring(6).toLowerCase() : null;
console.log("email:", email);

const user = db.prepare("SELECT id, name, age, university, email, gender, seeking, ideal_date FROM profiles WHERE email = ?").all(email);
console.log("用户数据：");
console.log(JSON.stringify(user, null, 2));

db.close();
