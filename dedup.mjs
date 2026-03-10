import Database from 'better-sqlite3';
const db = new Database('datematch.db');

console.log('=== 去重前总数 ===');
console.log(db.prepare('SELECT COUNT(*) as count FROM profiles').all());

console.log('\n=== 查找重复的 email ===');
const duplicates = db.prepare(`
  SELECT email, COUNT(*) as count 
  FROM profiles 
  GROUP BY email 
  HAVING COUNT(*) > 1
`).all();
console.log(JSON.stringify(duplicates, null, 2));

console.log('\n=== 保留最新记录（最大 id），删除重复的 email ===');
db.prepare(`
  DELETE FROM profiles 
  WHERE id NOT IN (
    SELECT MAX(id) 
    FROM profiles 
    GROUP BY email
  )
`).run();

console.log('\n=== 去重后总数 ===');
console.log(db.prepare('SELECT COUNT(*) as count FROM profiles').all());

console.log('\n=== 剩余记录 ===');
const profiles = db.prepare('SELECT id, name, email, created_at FROM profiles ORDER BY id').all();
console.log(JSON.stringify(profiles, null, 2));

db.close();
