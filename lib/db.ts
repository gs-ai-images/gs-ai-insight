/**
 * DB adapter — SQLite for local dev, Vercel Postgres in production.
 * Uses environment variable POSTGRES_URL to detect which to use.
 */

export type DbRow = Record<string, unknown>;

// ─── Local SQLite (development only) ───────────────────────────────────────

let sqliteDb: import('better-sqlite3').Database | null = null;

function getSqliteDb() {
  if (sqliteDb) return sqliteDb;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3');
  const path = require('path');
  const fs = require('fs');
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  sqliteDb = new Database(path.join(dataDir, 'gs-ai-insight.db')) as import('better-sqlite3').Database;
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
  initSqlite(sqliteDb);
  return sqliteDb;
}

function initSqlite(db: import('better-sqlite3').Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      author TEXT DEFAULT '관리자',
      author_token TEXT,
      image_url TEXT,
      link_url TEXT,
      slide_url TEXT,
      youtube_url TEXT,
      is_published INTEGER DEFAULT 1,
      is_admin_post INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
    CREATE TABLE IF NOT EXISTS prompt_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_input TEXT NOT NULL,
      optimized_prompt TEXT NOT NULL,
      category TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
    CREATE TABLE IF NOT EXISTS app_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      link_url TEXT NOT NULL,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
    CREATE TABLE IF NOT EXISTS library_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      prompt_text TEXT NOT NULL,
      category TEXT,
      image_url TEXT,
      tags TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
    CREATE TABLE IF NOT EXISTS library_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      source_url TEXT,
      tool_name TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);
}

// ─── Unified query interface ────────────────────────────────────────────────

export async function query(sql: string, params: unknown[] = []): Promise<DbRow[]> {
  if (process.env.POSTGRES_URL) {
    const { sql: pgSql } = await import('@vercel/postgres');
    // Convert ? placeholders to $1,$2,... for Postgres
    let i = 0;
    const pgQuery = sql.replace(/\?/g, () => `$${++i}`);
    const result = await pgSql.query(pgQuery, params as string[]);
    return result.rows as DbRow[];
  }

  // Local SQLite
  const db = getSqliteDb();
  const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(sql);
  if (isWrite) {
    const info = db.prepare(sql).run(...(params as (string | number | bigint | boolean | null | Buffer)[]));
    return [{ lastInsertRowid: info.lastInsertRowid, changes: info.changes }] as DbRow[];
  }
  return db.prepare(sql).all(...(params as (string | number | bigint | boolean | null | Buffer)[])) as DbRow[];
}

export async function queryOne(sql: string, params: unknown[] = []): Promise<DbRow | null> {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

// ─── Init schema for Postgres ───────────────────────────────────────────────

export async function initPostgres() {
  if (!process.env.POSTGRES_URL) return;
  const { sql } = await import('@vercel/postgres');
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      author TEXT DEFAULT '관리자',
      author_token TEXT,
      image_url TEXT,
      link_url TEXT,
      slide_url TEXT,
      youtube_url TEXT,
      is_published INTEGER DEFAULT 1,
      is_admin_post INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS prompt_history (
      id SERIAL PRIMARY KEY,
      user_input TEXT NOT NULL,
      optimized_prompt TEXT NOT NULL,
      category TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS app_services (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      link_url TEXT NOT NULL,
      is_published INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export default { query, queryOne };
