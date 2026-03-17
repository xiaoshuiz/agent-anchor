import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { randomUUID } from 'crypto'

const DB_VERSION = 1

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

export function getDb(): Database.Database | null {
  return db
}
