import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { randomUUID } from 'crypto'

const DB_VERSION = 7

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

function getDbVersion(database: Database.Database): number {
  const row = database.prepare('PRAGMA user_version').get() as { user_version: number }
  return row?.user_version ?? 0
}

function runMigrations(database: Database.Database): void {
  let current = getDbVersion(database)

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
    database.pragma('user_version = 1')
    current = 1
  }

  if (current >= 1 && current < 2) {
    try {
      database.exec('ALTER TABLE messages ADD COLUMN mentions TEXT')
    } catch {
      // Column may already exist
    }
    database.pragma('user_version = 2')
    current = 2
  }

  if (current >= 2 && current < 3) {
    try {
      database.exec('ALTER TABLE messages ADD COLUMN mentions TEXT')
    } catch {
      // Column may already exist (Phase 3)
    }
    database.exec(`
      CREATE TABLE IF NOT EXISTS channel_unread (
        channel_id TEXT PRIMARY KEY REFERENCES channels(id),
        count INTEGER NOT NULL DEFAULT 0,
        last_read_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_channel_unread_count ON channel_unread(count) WHERE count > 0;
    `)
    database.pragma('user_version = 3')
    current = 3
  }

  if (current >= 3 && current < 4) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS channel_members (
        channel_id TEXT NOT NULL REFERENCES channels(id),
        agent_id TEXT NOT NULL REFERENCES agents(id),
        PRIMARY KEY (channel_id, agent_id)
      );
      CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON channel_members(channel_id);
    `)
    database.pragma('user_version = 4')
    current = 4
  }

  if (current >= 4 && current < 5) {
    try {
      database.exec('ALTER TABLE channels ADD COLUMN type TEXT DEFAULT "channel"')
    } catch {
      // Column may already exist
    }
    try {
      database.exec('ALTER TABLE channels ADD COLUMN dm_agent_id TEXT REFERENCES agents(id)')
    } catch {
      // Column may already exist
    }
    database.pragma('user_version = 5')
    current = 5
  }

  if (current >= 5 && current < 6) {
    try {
      database.exec('ALTER TABLE agents ADD COLUMN provider TEXT DEFAULT "websocket"')
    } catch {
      // Column may already exist
    }
    database.pragma('user_version = 6')
    current = 6
  }

  // Fix: DBs created with buggy migration jumped to v6 without mentions column
  if (current === 6) {
    try {
      database.exec('ALTER TABLE messages ADD COLUMN mentions TEXT')
    } catch {
      // Column already exists
    }
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
  type?: 'channel' | 'dm'
  dm_agent_id?: string | null
}

export interface Agent {
  id: string
  name: string
  description: string | null
  avatar: string | null
  capabilities: string | null
  created_at: number
  provider?: 'claude' | 'websocket'
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
  const rows = database.prepare(
    'SELECT id, name, description, created_at, type, dm_agent_id FROM channels ORDER BY created_at ASC'
  ).all() as Array<Channel & { type?: string; dm_agent_id?: string | null }>
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    created_at: r.created_at,
    type: (r.type as 'channel' | 'dm') ?? 'channel',
    dm_agent_id: r.dm_agent_id ?? null,
  }))
}

export function agentsList(database: Database.Database): Agent[] {
  const rows = database.prepare(
    'SELECT id, name, description, avatar, capabilities, created_at, provider FROM agents ORDER BY created_at ASC'
  ).all() as Array<Agent & { provider?: string }>
  return rows.map((r) => ({
    ...r,
    provider: (r.provider === 'claude' ? 'claude' : 'websocket') as 'claude' | 'websocket',
  }))
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32) || 'agent'
}

function ensureUniqueClaudeId(database: Database.Database, base: string): string {
  let id = base
  let n = 1
  while (database.prepare('SELECT 1 FROM agents WHERE id = ?').get(id)) {
    id = `${base}-${n++}`
  }
  return id
}

export function insertAgent(
  database: Database.Database,
  params: {
    id?: string
    name: string
    description?: string | null
    avatar?: string | null
    capabilities?: string | null
    provider?: 'claude' | 'websocket'
  }
): Agent {
  const now = Math.floor(Date.now() / 1000)
  const caps = params.capabilities ?? null
  const capsStr = typeof caps === 'string' ? caps : caps ? JSON.stringify(caps) : null
  const provider = params.provider ?? 'websocket'
  const id =
    params.id ??
    (provider === 'claude' ? ensureUniqueClaudeId(database, `claude-${slugify(params.name)}`) : randomUUID())
  database
    .prepare(
      `INSERT INTO agents (id, name, description, avatar, capabilities, created_at, provider)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         avatar = excluded.avatar,
         capabilities = excluded.capabilities,
         provider = excluded.provider`
    )
    .run(id, params.name, params.description ?? null, params.avatar ?? null, capsStr, now, provider)
  const row = database
    .prepare('SELECT id, name, description, avatar, capabilities, created_at, provider FROM agents WHERE id = ?')
    .get(id) as Agent & { provider?: string }
  return { ...row, provider: (row?.provider === 'claude' ? 'claude' : 'websocket') as 'claude' | 'websocket' }
}

export function getAgentById(database: Database.Database, id: string): Agent | null {
  const row = database
    .prepare('SELECT id, name, description, avatar, capabilities, created_at, provider FROM agents WHERE id = ?')
    .get(id) as (Agent & { provider?: string }) | undefined
  if (!row) return null
  return { ...row, provider: (row.provider === 'claude' ? 'claude' : 'websocket') as 'claude' | 'websocket' }
}

export function getChannelById(database: Database.Database, id: string): Channel | null {
  const row = database.prepare(
    'SELECT id, name, description, created_at, type, dm_agent_id FROM channels WHERE id = ?'
  ).get(id) as (Channel & { type?: string; dm_agent_id?: string | null }) | undefined
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    created_at: row.created_at,
    type: (row.type as 'channel' | 'dm') ?? 'channel',
    dm_agent_id: row.dm_agent_id ?? null,
  }
}

export function insertChannel(
  database: Database.Database,
  params: { name: string; description?: string | null }
): Channel {
  const id = randomUUID()
  const now = Math.floor(Date.now() / 1000)
  database.prepare(
    'INSERT INTO channels (id, name, description, created_at) VALUES (?, ?, ?, ?)'
  ).run(id, params.name, params.description ?? null, now)
  return {
    id,
    name: params.name,
    description: params.description ?? null,
    created_at: now,
  }
}

export function insertChannelMembers(
  database: Database.Database,
  channelId: string,
  agentIds: string[]
): void {
  const stmt = database.prepare(
    'INSERT OR IGNORE INTO channel_members (channel_id, agent_id) VALUES (?, ?)'
  )
  for (const agentId of agentIds) {
    stmt.run(channelId, agentId)
  }
}

export function getChannelMembers(database: Database.Database, channelId: string): string[] {
  const rows = database.prepare(
    'SELECT agent_id FROM channel_members WHERE channel_id = ?'
  ).all(channelId) as { agent_id: string }[]
  return rows.map((r) => r.agent_id)
}

export function getOrCreateDm(database: Database.Database, agentId: string): Channel {
  const existing = database.prepare(
    'SELECT id, name, description, created_at, type, dm_agent_id FROM channels WHERE type = ? AND dm_agent_id = ?'
  ).get('dm', agentId) as (Channel & { type?: string; dm_agent_id?: string | null }) | undefined
  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      description: existing.description,
      created_at: existing.created_at,
      type: 'dm',
      dm_agent_id: agentId,
    }
  }
  const agent = database.prepare('SELECT name FROM agents WHERE id = ?').get(agentId) as { name: string } | undefined
  const name = agent ? `DM with ${agent.name}` : `DM with ${agentId}`
  const id = randomUUID()
  const now = Math.floor(Date.now() / 1000)
  database.prepare(
    'INSERT INTO channels (id, name, description, created_at, type, dm_agent_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, name, null, now, 'dm', agentId)
  return { id, name, description: null, created_at: now, type: 'dm', dm_agent_id: agentId }
}

export function getMessagesMentioningUser(database: Database.Database): Message[] {
  const rows = database.prepare(
    `SELECT id, channel_id, from_type, from_id, content, timestamp, thread_ts, mentions
     FROM messages WHERE mentions IS NOT NULL AND mentions LIKE ? ORDER BY timestamp DESC LIMIT 100`
  ).all('%"user"%') as Message[]
  return rows
}

export function getMessageById(database: Database.Database, id: string): Message | null {
  return (database
    .prepare(
      'SELECT id, channel_id, from_type, from_id, content, timestamp, thread_ts, mentions FROM messages WHERE id = ?'
    )
    .get(id) as Message) ?? null
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
    SELECT m.id, m.channel_id, m.from_type, m.from_id, m.content, m.timestamp, m.thread_ts, m.mentions,
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
    mentions: string | null
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
        mentions: r.mentions,
      },
      channelName: r.channel_name,
      fromName,
    }
  })
}

export function getDb(): Database.Database | null {
  return db
}
