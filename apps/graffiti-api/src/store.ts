/**
 * Persistence layer for the graffiti backend.
 *
 * Primary implementation: better-sqlite3. If the native module is not
 * available (build failure on this platform), JsonStore provides the same
 * interface backed by a single JSON file.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { JsonStore } from "./jsonStore.js";

export interface CellRow {
  seq: number;
  x: number;
  y: number;
  rgb: number;
}

export interface ClaimRow {
  code: string;
  amount: number;
  usedAt: number | null;
}

export interface CellInput {
  x: number;
  y: number;
  rgb: number;
}

export interface Store {
  readonly kind: "sqlite" | "json";
  /** All cell writes with seq strictly greater than `since`, in seq order. */
  getCellsSince(since: number): CellRow[];
  /** Highest seq present (0 when empty). */
  maxSeq(): number;
  /** Atomically reserve the next seq number and append cells with it. */
  appendCells(cells: CellInput[]): number;
  hasSignature(sig: string): boolean;
  addSignature(sig: string): void;
  hasMemo(memo: string): boolean;
  addMemo(memo: string): void;
  getClaim(code: string): ClaimRow | null;
  insertClaim(code: string, amount: number): void;
  /** Returns false if the code does not exist or was already used. */
  markClaimUsed(code: string): boolean;
  /** Client-side error sink for debugging paint-flow failures. */
  logClientError(err: { wallet?: string | null; phase?: string | null; message: string; detail?: string | null }): void;
  close(): void;
}

const nodeRequire = createRequire(import.meta.url);

export function openStore(dbPath: string): Store {
  try {
    const Database = nodeRequire("better-sqlite3") as typeof import("better-sqlite3");
    return new SqliteStore(dbPath, Database);
  } catch (err) {
    console.warn(
      `[store] better-sqlite3 unavailable (${(err as Error).message}); falling back to JSON store`
    );
    return new JsonStore(dbPath);
  }
}

class SqliteStore implements Store {
  readonly kind = "sqlite" as const;
  private db: import("better-sqlite3").Database;

  constructor(dbPath: string, Database: typeof import("better-sqlite3")) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
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
    `);
  }

  getCellsSince(since: number): CellRow[] {
    return this.db
      .prepare("SELECT seq, x, y, rgb FROM cells WHERE seq > ? ORDER BY seq, rowid")
      .all(since) as CellRow[];
  }

  maxSeq(): number {
    const row = this.db.prepare("SELECT COALESCE(MAX(seq), 0) AS m FROM cells").get() as { m: number };
    return row.m;
  }

  appendCells(cells: CellInput[]): number {
    const insert = this.db.prepare("INSERT INTO cells (seq, x, y, rgb) VALUES (?, ?, ?, ?)");
    const tx = this.db.transaction((list: CellInput[]) => {
      const seq = this.maxSeq() + 1;
      for (const c of list) insert.run(seq, c.x, c.y, c.rgb);
      return seq;
    });
    return tx(cells) as number;
  }

  hasSignature(sig: string): boolean {
    return !!this.db.prepare("SELECT 1 FROM signatures WHERE sig = ?").get(sig);
  }

  addSignature(sig: string): void {
    this.db.prepare("INSERT OR IGNORE INTO signatures (sig) VALUES (?)").run(sig);
  }

  hasMemo(memo: string): boolean {
    return !!this.db.prepare("SELECT 1 FROM memos WHERE memo = ?").get(memo);
  }

  addMemo(memo: string): void {
    this.db.prepare("INSERT OR IGNORE INTO memos (memo) VALUES (?)").run(memo);
  }

  getClaim(code: string): ClaimRow | null {
    return (
      (this.db
        .prepare("SELECT code, amount, used_at AS usedAt FROM claims WHERE code = ?")
        .get(code) as ClaimRow | undefined) ?? null
    );
  }

  insertClaim(code: string, amount: number): void {
    this.db
      .prepare("INSERT OR REPLACE INTO claims (code, amount, used_at) VALUES (?, ?, NULL)")
      .run(code, amount);
  }

  markClaimUsed(code: string): boolean {
    const res = this.db
      .prepare("UPDATE claims SET used_at = ? WHERE code = ? AND used_at IS NULL")
      .run(Date.now(), code);
    return res.changes > 0;
  }

  close(): void {
    this.db.close();
  }

  logClientError(err: { wallet?: string | null; phase?: string | null; message: string; detail?: string | null }): void {
    this.db
      .prepare("INSERT INTO client_errors (ts, wallet, phase, message, detail) VALUES (?, ?, ?, ?, ?)")
      .run(Date.now(), err.wallet ?? null, err.phase ?? null, err.message, err.detail ?? null);
  }
}
