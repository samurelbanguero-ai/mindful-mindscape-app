const tables = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    alias TEXT DEFAULT '',
    role TEXT DEFAULT 'usuario',
    visibility TEXT DEFAULT 'publico',
    profile_data TEXT DEFAULT '{}',
    email_verified INTEGER DEFAULT 0,
    login_attempts INTEGER DEFAULT 0,
    locked_until INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mood TEXT NOT NULL,
    title TEXT DEFAULT '',
    content TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    date TEXT DEFAULT '',
    intensity INTEGER DEFAULT 5,
    situations TEXT DEFAULT '[]',
    note TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS community_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT DEFAULT '',
    is_anonymous INTEGER NOT NULL DEFAULT 0,
    title TEXT DEFAULT '',
    body TEXT DEFAULT '',
    mood TEXT DEFAULT '',
    reported INTEGER DEFAULT 0,
    status TEXT DEFAULT 'approved',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS community_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_anonymous INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS post_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reaction_type TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    FOREIGN KEY(post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS spotify_tokens (
    user_id INTEGER PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS support_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    psychologist_id INTEGER,
    status TEXT DEFAULT 'pending',
    message TEXT DEFAULT '',
    share_journal INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(psychologist_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS support_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(request_id) REFERENCES support_requests(id) ON DELETE CASCADE,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    ip TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS email_verifications (
    user_id INTEGER PRIMARY KEY,
    code_hash TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    locked_until INTEGER DEFAULT 0,
    resend_count INTEGER DEFAULT 0,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    user_id INTEGER PRIMARY KEY,
    token_hash TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`;

const indexes = `
  CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(user_id, date DESC);
  CREATE INDEX IF NOT EXISTS idx_posts_status ON community_posts(status, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_posts_user ON community_posts(user_id);
  CREATE INDEX IF NOT EXISTS idx_replies_post ON community_replies(post_id);
  CREATE INDEX IF NOT EXISTS idx_reactions_post ON post_reactions(post_id);
  CREATE INDEX IF NOT EXISTS idx_spotify_user ON spotify_tokens(user_id);
  CREATE INDEX IF NOT EXISTS idx_support_user ON support_requests(user_id);
  CREATE INDEX IF NOT EXISTS idx_support_status ON support_requests(status);
  CREATE INDEX IF NOT EXISTS idx_support_messages_req ON support_messages(request_id);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token_hash);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
  CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
`;

const migrations = [
  "ALTER TABLE users ADD COLUMN alias TEXT DEFAULT '';",
  "ALTER TABLE users ADD COLUMN visibility TEXT DEFAULT 'publico';",
  "ALTER TABLE users ADD COLUMN profile_data TEXT DEFAULT '{}';",
  "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'usuario';",
  "ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN login_attempts INTEGER DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN locked_until INTEGER DEFAULT 0;",
  "ALTER TABLE journal_entries ADD COLUMN date TEXT DEFAULT '';",
  "ALTER TABLE journal_entries ADD COLUMN intensity INTEGER DEFAULT 5;",
  "ALTER TABLE journal_entries ADD COLUMN situations TEXT DEFAULT '[]';",
  "ALTER TABLE journal_entries ADD COLUMN note TEXT DEFAULT '';",
  "ALTER TABLE community_posts ADD COLUMN title TEXT DEFAULT '';",
  "ALTER TABLE community_posts ADD COLUMN body TEXT DEFAULT '';",
  "ALTER TABLE community_posts ADD COLUMN mood TEXT DEFAULT '';",
  "ALTER TABLE community_posts ADD COLUMN reported INTEGER DEFAULT 0;",
  "ALTER TABLE community_posts ADD COLUMN status TEXT DEFAULT 'approved';",
  "ALTER TABLE community_replies ADD COLUMN is_anonymous INTEGER DEFAULT 0;",
  "ALTER TABLE audit_logs ADD COLUMN ip TEXT;",
  "ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;",
  "ALTER TABLE password_resets ADD COLUMN attempts INTEGER DEFAULT 0;"
];

module.exports = {
  tables,
  indexes,
  migrations
};
