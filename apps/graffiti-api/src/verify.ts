import {
  Connection,
  type ParsedInstruction,
  type ParsedTransactionWithMeta,
  type PartiallyDecodedInstruction,
} from '@solana/web3.js'
import bs58 from 'bs58'

import { errorMessage, parsePublicKey } from './util.js'

import type { Config } from './config.js'
import type { Store } from './store.js'

const TOKEN_PROGRAMS = new Set([
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // spl-token
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', // token-2022
])
const MEMO_PROGRAMS = new Set([
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr', // v2 (spl-memo)
  'Memo1UhkJRfHyvLMcVucJwxXeuD7MMEq7ddQNbvqF8Ff', // v1
])

export type MemoResult = { memo: string } | { err: string }

export interface VerifyInput {
  txSignature: string | null
  walletPubkey: string
  costCells: number
}

/**
 * On success the caller owns the signature/memo reservations and must call
 * `release` if it cannot apply the draw, so a transient failure downstream
 * does not consume the user's burn.
 */
export type VerifyResult = { ok: true; burned: number; release: () => void } | Failure

type AnyInstruction = ParsedInstruction | PartiallyDecodedInstruction

interface BurnInfo {
  mint?: unknown
  account?: unknown
  authority?: unknown
  amount?: unknown
  tokenAmount?: { amount?: unknown }
}

interface Failure {
  ok: false
  reason: string
  retryable: boolean
}

type Rpc = Pick<Connection, 'getParsedTransaction'>

/** Verify a draw request against the burn tx on-chain (spec §Draw verification). */
export class DrawVerifier {
  private connection: Rpc | null

  constructor(
    private readonly config: Config,
    private readonly store: Store,
    rpc: Rpc | null = null,
  ) {
    this.connection = rpc
  }

  async verify(input: VerifyInput): Promise<VerifyResult> {
    const { txSignature, walletPubkey, costCells } = input

    const wallet = parsePublicKey(walletPubkey)
    if (!wallet) return reject('invalid walletPubkey', false)
    if (this.config.devInsecure) return this.verifyInsecure(txSignature, costCells)

    const mint = this.config.mint
    if (!mint) return reject('server misconfigured: MINT not set', false)
    if (!txSignature) return reject('txSignature required', false)

    // Reserve atomically up front: a check-then-insert leaves a window where
    // two concurrent requests both pass with the same burn.
    if (!this.store.claimSignature(txSignature)) return reject('signature already used', false)

    const checked = await this.checkTransaction(txSignature, wallet.toBase58(), mint, costCells)
    if (!checked.ok) {
      // The burn was not consumed by a draw, so free the signature: a client
      // retrying after a transient RPC miss must be able to use it.
      this.store.releaseSignature(txSignature)
      return checked
    }

    if (!this.store.claimMemo(checked.memo)) {
      this.store.releaseSignature(txSignature)
      return reject('memo already used (replay)', false)
    }

    return {
      ok: true,
      burned: checked.burned,
      release: () => {
        this.store.releaseSignature(txSignature)
        this.store.releaseMemo(checked.memo)
      },
    }
  }

  /** DEV_INSECURE: no on-chain check, but signature replay bookkeeping still applies. */
  private verifyInsecure(txSignature: string | null, costCells: number): VerifyResult {
    if (!txSignature) return { ok: true, burned: costCells, release: () => undefined }
    if (!this.store.claimSignature(txSignature)) return reject('signature already used', false)
    return { ok: true, burned: costCells, release: () => this.store.releaseSignature(txSignature) }
  }

  private rpc(): Rpc {
    if (!this.connection) {
      this.connection = new Connection(this.config.rpcUrl, this.config.verifyCommitment)
    }
    return this.connection
  }

  private async loadTransaction(signature: string): Promise<{ ok: true; tx: ParsedTransactionWithMeta } | Failure> {
    try {
      const tx = await this.rpc().getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: this.config.verifyCommitment,
      })
      // Not visible at this commitment yet: the client should retry.
      return tx ? { ok: true, tx } : reject('transaction not found yet', true)
    } catch (err: unknown) {
      return reject(`rpc error reading transaction: ${errorMessage(err)}`, true)
    }
  }

  private async checkTransaction(
    signature: string,
    walletB58: string,
    mint: string,
    costCells: number,
  ): Promise<{ ok: true; burned: number; memo: string } | Failure> {
    const loaded = await this.loadTransaction(signature)
    if (!loaded.ok) return loaded

    const invalid = checkExecution(loaded.tx, this.config.txMaxAgeSec)
    if (invalid) return invalid

    const burned = sumBurnsBy(loaded.tx, walletB58, mint)
    if (burned === 0) return reject('no burn of the graffiti mint by this wallet', false)
    if (burned < costCells) return reject(`burn amount ${burned} < cost ${costCells}`, false)

    const memo = findMemo(loaded.tx, walletB58, this.config.txMaxAgeSec)
    if ('err' in memo) return reject(memo.err, false)

    return { ok: true, burned, memo: memo.memo }
  }
}

/** Failure if the transaction did not succeed or is outside the freshness window. */
export function checkExecution(tx: ParsedTransactionWithMeta, maxAgeSec: number): Failure | null {
  // err === null means SUCCESS.
  if (!tx.meta || tx.meta.err) {
    return reject(`transaction failed: ${JSON.stringify(tx.meta?.err ?? 'meta missing')}`, false)
  }
  if (typeof tx.blockTime !== 'number') return reject('missing blockTime', false)

  const age = Math.floor(Date.now() / 1000) - tx.blockTime
  if (Math.abs(age) > maxAgeSec) return reject(`transaction outside the ${maxAgeSec}s window (${age}s)`, false)
  return null
}

/** The `graffiti:v1:<wallet>:<ts>` memo, if present and inside the freshness window. */
export function findMemo(tx: ParsedTransactionWithMeta, walletB58: string, maxAgeSec: number): MemoResult {
  const expected = new RegExp(`^graffiti:v1:${walletB58}:(\\d{10,13})$`)
  let found: { memo: string; ts: number } | null = null

  for (const ix of allInstructions(tx)) {
    if (!MEMO_PROGRAMS.has(ix.programId.toBase58())) continue
    const text = memoText(ix)
    const match = text ? expected.exec(text) : null
    if (text && match) found = { memo: text, ts: Number(match[1]) }
  }

  if (!found) return { err: 'missing/invalid memo (expected graffiti:v1:<pubkey>:<ts>)' }

  const tsMs = found.ts < 1e12 ? found.ts * 1000 : found.ts // seconds or ms
  if (Math.abs(Date.now() - tsMs) > maxAgeSec * 1000) return { err: 'memo ts outside freshness window' }
  return { memo: found.memo }
}

/**
 * Total burned of `mint` that is attributable to the wallet. Burns by anyone
 * else in the same transaction must not count toward cost.
 */
export function sumBurnsBy(tx: ParsedTransactionWithMeta, walletB58: string, mint: string): number {
  const owners = tokenAccountOwners(tx, mint)
  let total = 0

  for (const ix of allInstructions(tx)) {
    const info = burnInfo(ix, mint)
    if (info && isBurnedBy(info, walletB58, owners)) total += burnAmount(info)
  }
  return total
}

function allInstructions(tx: ParsedTransactionWithMeta): AnyInstruction[] {
  const out: AnyInstruction[] = [...tx.transaction.message.instructions]
  for (const inner of tx.meta?.innerInstructions ?? []) out.push(...inner.instructions)
  return out
}

/**
 * jsonParsed: `burn` carries info.amount; `burnChecked` carries
 * info.tokenAmount.amount (string).
 */
function burnAmount(info: BurnInfo): number {
  const amount = Number(info.tokenAmount?.amount ?? info.amount ?? 0)
  return Number.isFinite(amount) && amount > 0 ? amount : 0
}

/** The `info` of a burn / burnChecked instruction on `mint`, or null for anything else. */
function burnInfo(ix: AnyInstruction, mint: string): BurnInfo | null {
  if (!isParsed(ix) || !TOKEN_PROGRAMS.has(ix.programId.toBase58())) return null

  const parsed = ix.parsed as { type?: unknown; info?: BurnInfo } | null
  if (parsed?.type !== 'burn' && parsed?.type !== 'burnChecked') return null

  const info = parsed.info ?? {}
  return info.mint === mint ? info : null
}

/**
 * Whether the burn is attributable to the wallet: it either authorised the burn
 * itself, or owns the source token account (delegate burns).
 */
function isBurnedBy(info: BurnInfo, walletB58: string, owners: Map<string, string>): boolean {
  if (info.authority === walletB58) return true
  const account = typeof info.account === 'string' ? info.account : null
  return account !== null && owners.get(account) === walletB58
}

function isParsed(ix: AnyInstruction): ix is ParsedInstruction {
  return 'parsed' in ix
}

/**
 * spl-memo parses to a plain string; partially-decoded instructions carry a
 * base58 payload instead. Accept both.
 */
function memoText(ix: AnyInstruction): string | null {
  if (!isParsed(ix)) {
    try {
      return Buffer.from(bs58.decode(ix.data)).toString('utf8').trim()
    } catch {
      return null
    }
  }

  const parsed: unknown = ix.parsed
  if (typeof parsed === 'string') return parsed.trim()
  const data = (parsed as { data?: unknown } | null)?.data
  return typeof data === 'string' ? data.trim() : null
}

function reject(reason: string, retryable: boolean): Failure {
  return { ok: false, reason, retryable }
}

/** Owner of each token account of the graffiti mint, from pre-balances. */
function tokenAccountOwners(tx: ParsedTransactionWithMeta, mint: string): Map<string, string> {
  const keys = tx.transaction.message.accountKeys
  const owners = new Map<string, string>()
  for (const balance of tx.meta?.preTokenBalances ?? []) {
    if (balance.mint !== mint || !balance.owner) continue
    const key = keys[balance.accountIndex]
    if (key) owners.set(key.pubkey.toBase58(), balance.owner)
  }
  return owners
}
