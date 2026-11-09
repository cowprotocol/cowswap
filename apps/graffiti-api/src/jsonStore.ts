import fs from 'node:fs'
import path from 'node:path'

import type { CellInput, CellRow, ClaimRow, ClaimState, ClientErrorInput, Store } from './store.js'

interface JsonClaim {
  amount: number
  state: ClaimState
  usedAt: number | null
  txSignature: string | null
  failureReason: string | null
}

interface JsonState {
  seq: number
  cells: CellRow[]
  signatures: Record<string, true>
  memos: Record<string, true>
  claims: Record<string, JsonClaim>
}

/** Rows kept in the in-memory client-error sink. */
const CLIENT_ERROR_RETENTION = 500

/**
 * Fallback store with the same interface as SqliteStore, backed by one JSON
 * file. Synchronous full-file writes keep semantics simple; dev only — see
 * `openStore`, which refuses this store unless ALLOW_JSON_STORE is set.
 */
export class JsonStore implements Store {
  readonly kind = 'json' as const
  private errors: Array<{ ts: number } & ClientErrorInput> = []
  private state: JsonState
  private file: string

  constructor(dbPath: string) {
    this.file = dbPath.replace(/\.(db|sqlite3?)$/, '') + '.json'
    fs.mkdirSync(path.dirname(this.file), { recursive: true })
    if (fs.existsSync(this.file)) {
      this.state = migrate(JSON.parse(fs.readFileSync(this.file, 'utf8')) as JsonState)
    } else {
      this.state = { seq: 0, cells: [], signatures: {}, memos: {}, claims: {} }
      this.flush()
    }
  }

  private flush(): void {
    // Write-then-rename so a crash mid-write cannot truncate the state file.
    const tmp = `${this.file}.tmp`
    fs.writeFileSync(tmp, JSON.stringify(this.state))
    fs.renameSync(tmp, this.file)
  }

  getCellsSince(since: number, limit?: number): CellRow[] {
    const rows = this.state.cells.filter((c) => c.seq > since)
    return limit === undefined ? rows : rows.slice(0, limit)
  }

  maxSeq(): number {
    return this.state.seq
  }

  appendCells(cells: CellInput[]): number {
    const seq = this.state.seq + 1
    for (const c of cells) this.state.cells.push({ seq, x: c.x, y: c.y, rgb: c.rgb })
    this.state.seq = seq
    this.flush()
    return seq
  }

  claimSignature(sig: string): boolean {
    if (sig in this.state.signatures) return false
    this.state.signatures[sig] = true
    this.flush()
    return true
  }

  releaseSignature(sig: string): void {
    delete this.state.signatures[sig]
    this.flush()
  }

  claimMemo(memo: string): boolean {
    if (memo in this.state.memos) return false
    this.state.memos[memo] = true
    this.flush()
    return true
  }

  releaseMemo(memo: string): void {
    delete this.state.memos[memo]
    this.flush()
  }

  getClaim(code: string): ClaimRow | null {
    const c = this.state.claims[code]
    return c ? { code, ...c } : null
  }

  insertClaim(code: string, amount: number): void {
    this.state.claims[code] = {
      amount,
      state: 'unused',
      usedAt: null,
      txSignature: null,
      failureReason: null,
    }
    this.flush()
  }

  reserveClaim(code: string): boolean {
    const c = this.state.claims[code]
    if (!c || c.state !== 'unused') return false
    c.state = 'pending'
    this.flush()
    return true
  }

  settleClaim(code: string, txSignature: string): void {
    const c = this.state.claims[code]
    if (!c) return
    c.state = 'used'
    c.usedAt = Date.now()
    c.txSignature = txSignature
    this.flush()
  }

  releaseClaim(code: string): void {
    const c = this.state.claims[code]
    if (!c || c.state !== 'pending') return
    c.state = 'unused'
    c.usedAt = null
    this.flush()
  }

  failClaim(code: string, reason: string): void {
    const c = this.state.claims[code]
    if (!c || c.state !== 'pending') return
    c.state = 'failed'
    c.failureReason = reason.slice(0, 500)
    this.flush()
  }

  listFailedClaims(limit: number): ClaimRow[] {
    return Object.entries(this.state.claims)
      .filter(([, c]) => c.state === 'failed')
      .slice(0, limit)
      .map(([code, c]) => ({ code, ...c }))
  }

  logClientError(err: ClientErrorInput): void {
    this.errors.push({ ts: Date.now(), ...err })
    if (this.errors.length > CLIENT_ERROR_RETENTION) {
      this.errors.splice(0, this.errors.length - CLIENT_ERROR_RETENTION)
    }
  }

  close(): void {
    this.flush()
  }
}

/** Bring a state file written before the claim state machine up to date. */
function migrate(state: JsonState): JsonState {
  for (const claim of Object.values(state.claims)) {
    if (claim.state === undefined) {
      claim.state = claim.usedAt !== null ? 'used' : 'unused'
      claim.txSignature = claim.txSignature ?? null
      claim.failureReason = claim.failureReason ?? null
    }
  }
  return state
}
