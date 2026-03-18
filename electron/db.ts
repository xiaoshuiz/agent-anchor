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

  if (current >= 1 && current < 2) {
    try {
      database.exec('ALTER TABLE messages ADD COLUMN mentions TEXT')
    } catch {
      // Column may already exist
    }
    database.pragma('user_version = 2')
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
  mentions: string | null
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
    `SELECT id, channel_id, from_type, from_id, content, timestamp, thread_ts, mentions
     FROM messages WHERE channel_id = ? ORDER BY timestamp ASC`
  ).all(channelId) as Message[]
}

export function messagesListByThread(
  database: Database.Database,
  channelId: string,
  rootMessageId: string
): Message[] {
  return database.prepare(
    `SELECT id, channel_id, from_type, from_id, content, timestamp, thread_ts, mentions
     FROM messages WHERE channel_id = ? AND thread_ts = ? ORDER BY timestamp ASC`
  ).all(channelId, rootMessageId) as Message[]
}

export function getThreadCountByChannel(database: Database.Database, channelId: string): number {
  const row = database
    .prepare(
      `SELECT COUNT(*) as c FROM (
        SELECT DISTINCT thread_ts FROM messages
        WHERE channel_id = ? AND thread_ts IS NOT NULL
      )`
    )
    .get(channelId) as { c: number }
  return row?.c ?? 0
}

export function insertMessage(
  database: Database.Database,
  params: {
    channelId: string
    fromType: 'user' | 'agent'
    fromId: string
    content: string
    threadTs?: string | null
    mentions?: string[] | null
  }
): Message {
  const id = randomUUID()
  const ts = Date.now()
  const mentionsStr =
    params.mentions && params.mentions.length > 0
      ? JSON.stringify(params.mentions)
      : null
  database
    .prepare(
      `INSERT INTO messages (id, channel_id, from_type, from_id, content, timestamp, thread_ts, mentions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      params.channelId,
      params.fromType,
      params.fromId,
      params.content,
      ts,
      params.threadTs ?? null,
      mentionsStr
    )
  return {
    id,
    channel_id: params.channelId,
    from_type: params.fromType,
    from_id: params.fromId,
    content: params.content,
    timestamp: ts,
    thread_ts: params.threadTs ?? null,
    mentions: mentionsStr,
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

export function getMessageById(database: Database.Database, id: string): Message | null {
  return (database
    .prepare(
      'SELECT id, channel_id, from_type, from_id, content, timestamp, thread_ts, mentions FROM messages WHERE id = ?'
    )
    .get(id) as Message) ?? null
}

export function getDb(): Database.Database | null {
  return db
}
