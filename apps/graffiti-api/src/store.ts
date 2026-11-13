// The JSON fallback store has no durability guarantees under concurrency, so
// openStore refuses it unless ALLOW_JSON_STORE is set.
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { JsonStore } from './jsonStore.js'

export interface CellInput {
  x: number
  y: number
  rgb: number
}

export interface CellRow {
  seq: number
  x: number
  y: number
  rgb: number
}

export interface ClaimRow {
  code: string
  amount: number
  state: ClaimState
  usedAt: number | null
  txSignature: string | null
  failureReason: string | null
}

/**
 * `failed` means the transfer outcome is unknown — it may have landed on-chain.
 * It is never auto-released, or the treasury pays twice for one code.
 */
export type ClaimState = 'unused' | 'pending' | 'used' | 'failed'

export interface ClientErrorInput {
  wallet?: string | null
  phase?: string | null
  message: string
  detail?: string | null
}

export interface Store {
  readonly kind: 'sqlite' | 'json'
  /** In seq order. Omit `limit` to replay everything. */
  getCellsSince(since: number, limit?: number): CellRow[]
  /** 0 when empty. */
  maxSeq(): number
  /** Atomically reserve the next seq number and append cells with it. */
  appendCells(cells: CellInput[]): number
  /**
   * False when already recorded, which is the replay rejection. Must stay a
   * single atomic step: check-then-insert lets two concurrent requests through.
   */
  claimSignature(sig: string): boolean
  releaseSignature(sig: string): void
  /** False when already recorded. Atomic, as `claimSignature`. */
  claimMemo(memo: string): boolean
  releaseMemo(memo: string): void
  getClaim(code: string): ClaimRow | null
  insertClaim(code: string, amount: number): void
  /** False when the code is missing or not claimable. */
  reserveClaim(code: string): boolean
  settleClaim(code: string, txSignature: string): void
  /** Only safe when no transaction was submitted. */
  releaseClaim(code: string): void
  failClaim(code: string, reason: string): void
  listFailedClaims(limit: number): ClaimRow[]
  logClientError(err: ClientErrorInput): void
  close(): void
}

/** Rows kept in the client-error sink; older rows are pruned on insert. */
const CLIENT_ERROR_RETENTION = 5000

const nodeRequire = createRequire(import.meta.url)

export function openStore(dbPath: string, allowJsonFallback: boolean): Store {
  try {
    const Database = nodeRequire('better-sqlite3') as typeof import('better-sqlite3')
    return new SqliteStore(dbPath, Database)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (!allowJsonFallback) {
      throw new Error(
        `better-sqlite3 unavailable (${message}). The JSON fallback store is not safe for ` +
          `concurrent use; set ALLOW_JSON_STORE=1 to use it anyway (dev only).`,
      )
    }
    console.warn(`[store] better-sqlite3 unavailable (${message}); falling back to JSON store`)
    return new JsonStore(dbPath)
  }
}

class SqliteStore implements Store {
  readonly kind = 'sqlite' as const
  private db: import('better-sqlite3').Database

  constructor(dbPath: string, Database: typeof import('better-sqlite3')) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cells (
        seq   INTEGER NOT NULL,
        x     INTEGER NOT NULL,
        y     INTEGER NOT NULL,
        rgb   INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cells_seq ON cells(seq);
      CREATE TABLE IF NOT EXISTS signatures (sig TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS memos (memo TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS client_errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts INTEGER NOT NULL,
        wallet TEXT,
        phase TEXT,
        message TEXT NOT NULL,
        detail TEXT
      );
      CREATE TABLE IF NOT EXISTS claims (
        code   TEXT PRIMARY KEY,
        amount INTEGER NOT NULL,
        used_at INTEGER
      );
    `)
    this.migrateClaims()
  }

  private migrateClaims(): void {
    const columns = this.db.prepare('PRAGMA table_info(claims)').all() as Array<{ name: string }>
    const names = new Set(columns.map((c) => c.name))
    if (!names.has('state')) {
      this.db.exec("ALTER TABLE claims ADD COLUMN state TEXT NOT NULL DEFAULT 'unused'")
      // Pre-migration rows encoded "used" as a non-null used_at.
      this.db.exec("UPDATE claims SET state = 'used' WHERE used_at IS NOT NULL")
    }
    if (!names.has('tx_signature')) {
      this.db.exec('ALTER TABLE claims ADD COLUMN tx_signature TEXT')
    }
    if (!names.has('failure_reason')) {
      this.db.exec('ALTER TABLE claims ADD COLUMN failure_reason TEXT')
    }
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_claims_state ON claims(state)')
  }

  getCellsSince(since: number, limit?: number): CellRow[] {
    if (limit === undefined) {
      return this.db
        .prepare('SELECT seq, x, y, rgb FROM cells WHERE seq > ? ORDER BY seq, rowid')
        .all(since) as CellRow[]
    }
    return this.db
      .prepare('SELECT seq, x, y, rgb FROM cells WHERE seq > ? ORDER BY seq, rowid LIMIT ?')
      .all(since, limit) as CellRow[]
  }

  maxSeq(): number {
    const row = this.db.prepare('SELECT COALESCE(MAX(seq), 0) AS m FROM cells').get() as { m: number }
    return row.m
  }

  appendCells(cells: CellInput[]): number {
    const insert = this.db.prepare('INSERT INTO cells (seq, x, y, rgb) VALUES (?, ?, ?, ?)')
    const tx = this.db.transaction((list: CellInput[]) => {
      const seq = this.maxSeq() + 1
      for (const c of list) insert.run(seq, c.x, c.y, c.rgb)
      return seq
    })
    return tx(cells) as number
  }

  claimSignature(sig: string): boolean {
    return this.db.prepare('INSERT OR IGNORE INTO signatures (sig) VALUES (?)').run(sig).changes > 0
  }

  releaseSignature(sig: string): void {
    this.db.prepare('DELETE FROM signatures WHERE sig = ?').run(sig)
  }

  claimMemo(memo: string): boolean {
    return this.db.prepare('INSERT OR IGNORE INTO memos (memo) VALUES (?)').run(memo).changes > 0
  }

  releaseMemo(memo: string): void {
    this.db.prepare('DELETE FROM memos WHERE memo = ?').run(memo)
  }

  getClaim(code: string): ClaimRow | null {
    return (
      (this.db
        .prepare(
          `SELECT code, amount, state, used_at AS usedAt, tx_signature AS txSignature,
                  failure_reason AS failureReason
             FROM claims WHERE code = ?`,
        )
        .get(code) as ClaimRow | undefined) ?? null
    )
  }

  insertClaim(code: string, amount: number): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO claims (code, amount, state, used_at, tx_signature, failure_reason)
         VALUES (?, ?, 'unused', NULL, NULL, NULL)`,
      )
      .run(code, amount)
  }

  reserveClaim(code: string): boolean {
    return (
      this.db.prepare("UPDATE claims SET state = 'pending' WHERE code = ? AND state = 'unused'").run(code).changes > 0
    )
  }

  settleClaim(code: string, txSignature: string): void {
    this.db
      .prepare("UPDATE claims SET state = 'used', used_at = ?, tx_signature = ? WHERE code = ?")
      .run(Date.now(), txSignature, code)
  }

  releaseClaim(code: string): void {
    this.db.prepare("UPDATE claims SET state = 'unused', used_at = NULL WHERE code = ? AND state = 'pending'").run(code)
  }

  failClaim(code: string, reason: string): void {
    this.db
      .prepare("UPDATE claims SET state = 'failed', failure_reason = ? WHERE code = ? AND state = 'pending'")
      .run(reason.slice(0, 500), code)
  }

  listFailedClaims(limit: number): ClaimRow[] {
    return this.db
      .prepare(
        `SELECT code, amount, state, used_at AS usedAt, tx_signature AS txSignature,
                failure_reason AS failureReason
           FROM claims WHERE state = 'failed' ORDER BY code LIMIT ?`,
      )
      .all(limit) as ClaimRow[]
  }

  logClientError(err: ClientErrorInput): void {
    const prune = this.db.transaction((e: ClientErrorInput) => {
      this.db
        .prepare('INSERT INTO client_errors (ts, wallet, phase, message, detail) VALUES (?, ?, ?, ?, ?)')
        .run(Date.now(), e.wallet ?? null, e.phase ?? null, e.message, e.detail ?? null)
      this.db
        .prepare(
          `DELETE FROM client_errors WHERE id <= (
             SELECT MAX(id) - ? FROM client_errors
           )`,
        )
        .run(CLIENT_ERROR_RETENTION)
    })
    prune(err)
  }

  close(): void {
    this.db.close()
  }
}
