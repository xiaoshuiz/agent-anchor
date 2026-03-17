import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { randomUUID } from 'crypto'

const DB_VERSION = 2

let db: Database.Database | null = null

function getDbPath(): string {
  return join(app.getPath('userData'), 'agent-anchor.db')
}

export function initDb(): Database.Database {
  if (db) return db
  const path = getDbPath()
  db = new Database(path)
  runMigrations(db)
  return db
}

function runMigrations(database: Database.Database): void {
  const version = database.prepare('PRAGMA user_version').get() as { user_version: number }
  const current = version?.user_version ?? 0

  if (current < 1) {
    database.exec(`
      CREATE TABLE channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        avatar TEXT,
        capabilities TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL REFERENCES channels(id),
        from_type TEXT NOT NULL CHECK (from_type IN ('user', 'agent')),
        from_id TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        thread_ts TEXT REFERENCES messages(id)
      );
      CREATE TABLE threads (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL REFERENCES channels(id),
        root_message_id TEXT NOT NULL REFERENCES messages(id),
        created_at INTEGER NOT NULL
      );
      CREATE INDEX idx_messages_channel ON messages(channel_id);
      CREATE INDEX idx_messages_channel_ts ON messages(channel_id, timestamp);
      CREATE INDEX idx_threads_channel ON threads(channel_id);
    `)
    database.pragma(`user_version = ${DB_VERSION}`)
  }

  if (current < 2) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS channel_unread (
        channel_id TEXT PRIMARY KEY REFERENCES channels(id),
        count INTEGER NOT NULL DEFAULT 0,
        last_read_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_channel_unread_count ON channel_unread(count) WHERE count > 0;
    `)
    database.pragma(`user_version = ${DB_VERSION}`)
  }
}

export function seedGeneralIfEmpty(database: Database.Database): void {
  const count = database.prepare('SELECT count(*) as c FROM channels').get() as { c: number }
  if (count.c === 0) {
    const id = randomUUID()
    const now = Math.floor(Date.now() / 1000)
    database.prepare(
      'INSERT INTO channels (id, name, description, created_at) VALUES (?, ?, ?, ?)'
    ).run(id, '#general', 'General channel', now)
  }
}

export interface Channel {
  id: string
  name: string
  description: string | null
  created_at: number
}

export interface Agent {
  id: string
  name: string
  description: string | null
  avatar: string | null
  capabilities: string | null
  created_at: number
}

export interface Message {
  id: string
  channel_id: string
  from_type: 'user' | 'agent'
  from_id: string
  content: string
  timestamp: number
  thread_ts: string | null
}

export function channelsList(database: Database.Database): Channel[] {
  return database.prepare(
    'SELECT id, name, description, created_at FROM channels ORDER BY created_at ASC'
  ).all() as Channel[]
}

export function agentsList(database: Database.Database): Agent[] {
  return database.prepare(
    'SELECT id, name, description, avatar, capabilities, created_at FROM agents ORDER BY created_at ASC'
  ).all() as Agent[]
}

export function messagesListByChannel(database: Database.Database, channelId: string): Message[] {
  return database.prepare(
    `SELECT id, channel_id, from_type, from_id, content, timestamp, thread_ts
     FROM messages WHERE channel_id = ? ORDER BY timestamp ASC`
  ).all(channelId) as Message[]
}

export function insertMessage(
  database: Database.Database,
  params: {
    channelId: string
    fromType: 'user' | 'agent'
    fromId: string
    content: string
    threadTs?: string | null
  }
): Message {
  const id = randomUUID()
  const ts = Date.now()
  database
    .prepare(
      `INSERT INTO messages (id, channel_id, from_type, from_id, content, timestamp, thread_ts)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      params.channelId,
      params.fromType,
      params.fromId,
      params.content,
      ts,
      params.threadTs ?? null
    )
  return {
    id,
    channel_id: params.channelId,
    from_type: params.fromType,
    from_id: params.fromId,
    content: params.content,
    timestamp: ts,
    thread_ts: params.threadTs ?? null,
  }
}

export function insertAgent(
  database: Database.Database,
  params: { id: string; name: string; description?: string | null; avatar?: string | null; capabilities?: string | null }
): Agent {
  const now = Math.floor(Date.now() / 1000)
  const caps = params.capabilities ?? null
  const capsStr = typeof caps === 'string' ? caps : caps ? JSON.stringify(caps) : null
  database
    .prepare(
      `INSERT INTO agents (id, name, description, avatar, capabilities, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         avatar = excluded.avatar,
         capabilities = excluded.capabilities`
    )
    .run(
      params.id,
      params.name,
      params.description ?? null,
      params.avatar ?? null,
      capsStr,
      now
    )
  const row = database.prepare('SELECT id, name, description, avatar, capabilities, created_at FROM agents WHERE id = ?').get(params.id) as Agent
  return row
}

export function getChannelById(database: Database.Database, id: string): Channel | null {
  return (database.prepare('SELECT id, name, description, created_at FROM channels WHERE id = ?').get(id) as Channel) ?? null
}

export function getUnreadCounts(database: Database.Database): Record<string, number> {
  const rows = database.prepare(
    'SELECT channel_id, count FROM channel_unread WHERE count > 0'
  ).all() as { channel_id: string; count: number }[]
  return Object.fromEntries(rows.map((r) => [r.channel_id, r.count]))
}

export function markChannelRead(database: Database.Database, channelId: string): void {
  const now = Math.floor(Date.now() / 1000)
  database.prepare(
    'INSERT INTO channel_unread (channel_id, count, last_read_at) VALUES (?, 0, ?) ON CONFLICT(channel_id) DO UPDATE SET count = 0, last_read_at = excluded.last_read_at'
  ).run(channelId, now)
}

export function incrementUnread(database: Database.Database, channelId: string): void {
  database.prepare(
    `INSERT INTO channel_unread (channel_id, count, last_read_at) VALUES (?, 1, NULL)
     ON CONFLICT(channel_id) DO UPDATE SET count = count + 1`
  ).run(channelId)
}

export interface SearchResultRow {
  message: Message
  channelName: string
  fromName: string
}

export function searchMessages(
  database: Database.Database,
  params: { keyword: string; channelId?: string; fromId?: string }
): SearchResultRow[] {
  const { keyword, channelId, fromId } = params
  const term = `%${keyword.trim()}%`
  if (!term || term === '%%') return []

  let sql = `
    SELECT m.id, m.channel_id, m.from_type, m.from_id, m.content, m.timestamp, m.thread_ts,
           c.name as channel_name
    FROM messages m
    JOIN channels c ON m.channel_id = c.id
    WHERE m.content LIKE ?
  `
  const args: (string | number)[] = [term]
  if (channelId) {
    sql += ' AND m.channel_id = ?'
    args.push(channelId)
  }
  if (fromId) {
    sql += ' AND m.from_id = ?'
    args.push(fromId)
  }
  sql += ' ORDER BY m.timestamp DESC LIMIT 100'

  const rows = database.prepare(sql).all(...args) as Array<{
    id: string
    channel_id: string
    from_type: string
    from_id: string
    content: string
    timestamp: number
    thread_ts: string | null
    channel_name: string
  }>

  const agentCache = new Map<string, string>()
  return rows.map((r) => {
    let fromName = 'You'
    if (r.from_type === 'agent') {
      if (!agentCache.has(r.from_id)) {
        const agent = database.prepare('SELECT name FROM agents WHERE id = ?').get(r.from_id) as { name: string } | undefined
        agentCache.set(r.from_id, agent?.name ?? r.from_id)
      }
      fromName = agentCache.get(r.from_id) ?? r.from_id
    }
    return {
      message: {
        id: r.id,
        channel_id: r.channel_id,
        from_type: r.from_type as 'user' | 'agent',
        from_id: r.from_id,
        content: r.content,
        timestamp: r.timestamp,
        thread_ts: r.thread_ts,
      },
      channelName: r.channel_name,
      fromName,
    }
  })
}

export function getDb(): Database.Database | null {
  return db
}
