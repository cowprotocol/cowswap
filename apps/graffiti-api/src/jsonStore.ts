import fs from "node:fs";
import path from "node:path";
import type { CellInput, CellRow, ClaimRow, Store } from "./store.js";

interface JsonState {
  seq: number;
  cells: CellRow[];
  signatures: Record<string, true>;
  memos: Record<string, true>;
  claims: Record<string, { amount: number; usedAt: number | null }>;
}

/**
 * Fallback store with the same interface as SqliteStore, backed by one JSON
 * file. Synchronous full-file writes keep semantics simple; fine for dev and
 * small deployments.
 */
export class JsonStore implements Store {
  private errors: Array<{ ts: number; message: string; [k: string]: unknown }> = []

  readonly kind = "json" as const;
  private state: JsonState;
  private file: string;

  constructor(dbPath: string) {
    this.file = dbPath.replace(/\.(db|sqlite3?)$/, "") + ".json";
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    if (fs.existsSync(this.file)) {
      this.state = JSON.parse(fs.readFileSync(this.file, "utf8")) as JsonState;
    } else {
      this.state = { seq: 0, cells: [], signatures: {}, memos: {}, claims: {} };
      this.flush();
    }
  }

  private flush(): void {
    fs.writeFileSync(this.file, JSON.stringify(this.state));
  }

  getCellsSince(since: number): CellRow[] {
    return this.state.cells.filter((c) => c.seq > since);
  }

  maxSeq(): number {
    return this.state.seq;
  }

  appendCells(cells: CellInput[]): number {
    const seq = this.state.seq + 1;
    for (const c of cells) this.state.cells.push({ seq, x: c.x, y: c.y, rgb: c.rgb });
    this.state.seq = seq;
    this.flush();
    return seq;
  }

  hasSignature(sig: string): boolean {
    return sig in this.state.signatures;
  }

  addSignature(sig: string): void {
    this.state.signatures[sig] = true;
    this.flush();
  }

  hasMemo(memo: string): boolean {
    return memo in this.state.memos;
  }

  addMemo(memo: string): void {
    this.state.memos[memo] = true;
    this.flush();
  }

  getClaim(code: string): ClaimRow | null {
    const c = this.state.claims[code];
    return c ? { code, amount: c.amount, usedAt: c.usedAt } : null;
  }

  insertClaim(code: string, amount: number): void {
    this.state.claims[code] = { amount, usedAt: null };
    this.flush();
  }

  logClientError(err: { wallet?: string | null; phase?: string | null; message: string; detail?: string | null }): void {
    // best-effort: JSON fallback keeps errors in memory only
    this.errors.push({ ts: Date.now(), ...err });
  }

  markClaimUsed(code: string): boolean {
    const c = this.state.claims[code];
    if (!c || c.usedAt !== null) return false;
    c.usedAt = Date.now();
    this.flush();
    return true;
  }

  close(): void {
    this.flush();
  }
}
