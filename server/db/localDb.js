/**
 * Local SQLite Database
 * Persists users, credits, and plans across server restarts.
 * DB file: server/data/quickai.db
 */
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'quickai.db');

mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     TEXT,
    first_name    TEXT,
    last_name     TEXT,
    phone         TEXT DEFAULT '',
    role          TEXT DEFAULT 'user',
    plan          TEXT DEFAULT 'free',
    credits       INTEGER DEFAULT 1000,
    plan_expires  TEXT DEFAULT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Community and Creations Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS community_posts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT NOT NULL,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    category    TEXT NOT NULL,
    upvotes     TEXT DEFAULT '[]',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS community_replies (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id        INTEGER NOT NULL,
    user_id        TEXT NOT NULL,
    content        TEXT NOT NULL,
    is_recommended INTEGER DEFAULT 0,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES community_posts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS creations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    TEXT NOT NULL,
    prompt     TEXT NOT NULL,
    content    TEXT NOT NULL,
    type       TEXT NOT NULL,
    publish    INTEGER DEFAULT 0,
    likes      TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add new columns if they don't exist (safe migration)
const cols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
if (!cols.includes('plan'))        db.exec("ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free'");
if (!cols.includes('credits'))     db.exec("ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 1000");
if (!cols.includes('plan_expires'))db.exec("ALTER TABLE users ADD COLUMN plan_expires TEXT DEFAULT NULL");

// ── Seed Accounts ─────────────────────────────────────────────────────────────
const seedUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role, plan, credits)
  VALUES (@id, @email, @passwordHash, @fullName, @role, @plan, @credits)
`);

const adminHash  = bcrypt.hashSync('admin@123',   10);
const defHash    = bcrypt.hashSync('password123', 10);

// Admin — unlimited credits
seedUser.run({ id: 'admin', email: 'admin@quickai.com', passwordHash: adminHash, fullName: 'Admin', role: 'admin', plan: 'admin', credits: 999999 });
// Dev test accounts
seedUser.run({ id: 'user@quick.ai',  email: 'user@quick.ai',  passwordHash: defHash, fullName: 'Standard User', role: 'user', plan: 'free', credits: 1000 });

// ── Seed Community Posts ───────────────────────────────────────────────────────
const countPosts = db.prepare('SELECT COUNT(*) as count FROM community_posts').get().count;
if (countPosts === 0) {
  const seedPost = db.prepare(`
    INSERT INTO community_posts (user_id, title, content, category)
    VALUES (?, ?, ?, ?)
  `);
  const seedReply = db.prepare(`
    INSERT INTO community_replies (post_id, user_id, content, is_recommended)
    VALUES (?, ?, ?, ?)
  `);

  // Post 1
  const post1Id = seedPost.run(
    'user@quick.ai',
    'How do I renew my yearly Pro subscription plan?',
    'Hi everyone, I am currently on the free trial plan and I would like to upgrade to the yearly Pro subscription. How do I renew or upgrade my plan? Are there other payment options?',
    'Account Access & Credits'
  ).lastInsertRowid;

  seedReply.run(post1Id, 'user@quick.ai', 'You can just click the "Upgrade Plan" card in the community page or use the navigation sidebar link. It is super fast!', 0);
  seedReply.run(post1Id, 'admin', 'Thanks for asking! You can upgrade anytime by selecting the "Pro Yearly" option in the Upgrade panel. Let us know if you encounter any payment issues.', 1);

  // Post 2
  const post2Id = seedPost.run(
    'user@quick.ai',
    'Why does background removal fail on large files?',
    'Every time I try to upload a 10MB high-res PNG file to remove background, it gets stuck or returns an error. What are the file size limits for background removal?',
    'Image Tools & BG Removal'
  ).lastInsertRowid;

  seedReply.run(post2Id, 'user@quick.ai', 'Try resizing the image to under 5MB, that worked for me.', 0);
  seedReply.run(post2Id, 'admin', 'We recommend files under 5MB for optimal processing speeds. Files larger than 8MB are automatically rejected to prevent timeouts.', 1);

  // Post 3
  const post3Id = seedPost.run(
    'user@quick.ai',
    'How do I get my API key for custom integrations?',
    'I am trying to run QuickAI\'s translation and writing models in my local node.js script. Where can I find my API key?',
    'API Integration'
  ).lastInsertRowid;

  seedReply.run(post3Id, 'admin', 'API keys are currently available for Pro Tier members. You can generate yours under settings. Contact developer-support@quickai.com for high volume enterprise limits.', 1);
}

console.log('[SQLite] DB ready at:', DB_PATH);

// ── Queries ───────────────────────────────────────────────────────────────────

export const findUserByEmail = (email) =>
  db.prepare('SELECT * FROM users WHERE email = ?').get(email);

export const findUserById = (id) =>
  db.prepare('SELECT * FROM users WHERE id = ?').get(id);

export const createOrUpdateUser = ({ id, email, passwordHash, fullName, firstName, lastName, phone, role, plan, credits }) =>
  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, first_name, last_name, phone, role, plan, credits)
    VALUES (@id, @email, @passwordHash, @fullName, @firstName, @lastName, @phone, @role, @plan, @credits)
    ON CONFLICT(email) DO UPDATE SET
      password_hash = excluded.password_hash,
      full_name     = excluded.full_name,
      first_name    = excluded.first_name,
      last_name     = excluded.last_name,
      phone         = excluded.phone
  `).run({ id, email, passwordHash, fullName, firstName, lastName, phone, role: role || 'user', plan: plan || 'free', credits: credits ?? 1000 });

/** Deduct credits. Returns new balance, or -1 if insufficient. */
export const deductCredit = (userId, amount = 1) => {
  const user = findUserById(userId) || findUserByEmail(userId);
  if (!user) return -1;

  // Admin / Pro plans — unlimited
  if (user.role === 'admin' || user.plan === 'admin' || user.plan === 'monthly' || user.plan === 'yearly') {
    return 999999;
  }

  if (user.credits < amount) return -1; // insufficient

  db.prepare('UPDATE users SET credits = credits - ? WHERE id = ?').run(amount, user.id);
  return user.credits - amount;
};

/** Get current credit balance */
export const getCredits = (userId) => {
  const user = findUserById(userId) || findUserByEmail(userId);
  if (!user) return 0;
  if (user.role === 'admin' || user.plan === 'admin' || user.plan === 'monthly' || user.plan === 'yearly') return 999999;
  return user.credits;
};

/** Update user plan */
export const setUserPlan = (userId, plan, expiresIso = null) =>
  db.prepare('UPDATE users SET plan = ?, plan_expires = ? WHERE id = ?').run(plan, expiresIso, userId);

// ── Community Helpers ────────────────────────────────────────────────────────
export const createPost = ({ userId, title, content, category }) => {
  const info = db.prepare(`
    INSERT INTO community_posts (user_id, title, content, category)
    VALUES (?, ?, ?, ?)
  `).run(userId, title, content, category);
  return info.lastInsertRowid;
};

export const getPosts = (category, search) => {
  let query = `
    SELECT p.*, u.full_name as author_name, u.role as author_role, u.plan as author_plan
    FROM community_posts p
    LEFT JOIN users u ON u.id = p.user_id
  `;
  const params = [];
  const clauses = [];

  if (category && category !== 'All') {
    clauses.push('p.category = ?');
    params.push(category);
  }

  if (search) {
    clauses.push('(p.title LIKE ? OR p.content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (clauses.length > 0) {
    query += ' WHERE ' + clauses.join(' AND ');
  }

  query += ' ORDER BY p.created_at DESC';

  const posts = db.prepare(query).all(...params);
  return posts.map(p => ({
    ...p,
    upvotes: JSON.parse(p.upvotes || '[]')
  }));
};

export const getPostById = (postId) => {
  const post = db.prepare(`
    SELECT p.*, u.full_name as author_name, u.role as author_role, u.plan as author_plan
    FROM community_posts p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.id = ?
  `).get(postId);
  
  if (post) {
    post.upvotes = JSON.parse(post.upvotes || '[]');
  }
  return post;
};

export const getRepliesForPost = (postId) => {
  return db.prepare(`
    SELECT r.*, u.full_name as author_name, u.role as author_role, u.plan as author_plan
    FROM community_replies r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.post_id = ?
    ORDER BY r.is_recommended DESC, r.created_at ASC
  `).all(postId);
};

export const togglePostUpvote = (postId, userId) => {
  const post = getPostById(postId);
  if (!post) return null;

  let upvotes = post.upvotes;
  if (upvotes.includes(userId)) {
    upvotes = upvotes.filter(id => id !== userId);
  } else {
    upvotes.push(userId);
  }

  db.prepare('UPDATE community_posts SET upvotes = ? WHERE id = ?')
    .run(JSON.stringify(upvotes), postId);

  return upvotes;
};

export const createReply = ({ postId, userId, content }) => {
  const info = db.prepare(`
    INSERT INTO community_replies (post_id, user_id, content)
    VALUES (?, ?, ?)
  `).run(postId, userId, content);
  return info.lastInsertRowid;
};

export const toggleReplyRecommendation = (replyId) => {
  const reply = db.prepare('SELECT * FROM community_replies WHERE id = ?').get(replyId);
  if (!reply) return null;

  const newStatus = reply.is_recommended ? 0 : 1;
  db.prepare('UPDATE community_replies SET is_recommended = ? WHERE id = ?')
    .run(newStatus, replyId);

  return newStatus;
};

// ── Creations Helpers ────────────────────────────────────────────────────────
export const saveCreation = ({ userId, prompt, content, type }) => {
  db.prepare(`
    INSERT INTO creations (user_id, prompt, content, type)
    VALUES (?, ?, ?, ?)
  `).run(userId, prompt, content, type);
};

export const getUserCreations = (userId) => {
  return db.prepare('SELECT * FROM creations WHERE user_id = ? ORDER BY created_at DESC').all(userId);
};

export const getAllCreations = () => {
  return db.prepare(`
    SELECT c.*, u.full_name as userName, u.email as userEmail
    FROM creations c
    LEFT JOIN users u ON u.id = c.user_id
    ORDER BY c.created_at DESC
  `).all();
};

export const getPublishedCreations = () => {
  const raw = db.prepare(`
    SELECT c.*, u.full_name as user_name
    FROM creations c
    LEFT JOIN users u ON u.id = c.user_id
    WHERE c.publish = 1
    ORDER BY c.created_at DESC
  `).all();
  return raw.map(c => ({
    ...c,
    likes: JSON.parse(c.likes || '[]'),
    user_name: c.user_name || c.user_id.split('@')[0]
  }));
};

export const toggleLikeCreation = (creationId, userId) => {
  const creation = db.prepare('SELECT * FROM creations WHERE id = ?').get(creationId);
  if (!creation) return null;

  let likes = JSON.parse(creation.likes || '[]');
  if (likes.includes(userId)) {
    likes = likes.filter(id => id !== userId);
  } else {
    likes.push(userId);
  }

  db.prepare('UPDATE creations SET likes = ? WHERE id = ?').run(JSON.stringify(likes), creationId);
  return likes;
};

// ── Admin Helpers ────────────────────────────────────────────────────────────
export const getAllUsers = () => {
  return db.prepare("SELECT id, email, full_name as fullName, role, plan, credits, created_at as createdAt FROM users WHERE role != 'admin'").all();
};

export const deleteUser = (userId) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
};

export const updateUserCredits = (userId, credits) => {
  db.prepare('UPDATE users SET credits = ? WHERE id = ?').run(credits, userId);
};

export const updateUserAdmin = (userId, { fullName, email, role, plan, credits, password }) => {
  let query = 'UPDATE users SET full_name = ?, email = ?, role = ?, plan = ?, credits = ?';
  const params = [fullName, email, role, plan, Number(credits)];
  if (password) {
    const passwordHash = bcrypt.hashSync(password, 10);
    query += ', password_hash = ?';
    params.push(passwordHash);
  }
  query += ' WHERE id = ?';
  params.push(userId);
  db.prepare(query).run(...params);
};

export const addUser = ({ email, password, fullName, role, plan, credits }) => {
  const passwordHash = bcrypt.hashSync(password, 10);
  const userId = email;
  db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, plan, credits)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, email, passwordHash, fullName, role || 'user', plan || 'free', credits || 1000);
};

export default db;
