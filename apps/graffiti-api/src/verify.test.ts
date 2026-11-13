import { Keypair, PublicKey, type ParsedTransactionWithMeta } from '@solana/web3.js'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, test } from 'node:test'

import { JsonStore } from './jsonStore.js'
import { checkExecution, DrawVerifier, findMemo, sumBurnsBy } from './verify.js'

import type { Config } from './config.js'

const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
const MEMO_PROGRAM = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'

const MINT = Keypair.generate().publicKey.toBase58()
const WALLET = Keypair.generate().publicKey.toBase58()
const OTHER = Keypair.generate().publicKey.toBase58()

interface FakeIx {
  programId: PublicKey
  parsed: unknown
}

const burnIx = (info: Record<string, unknown>, type = 'burnChecked', mint = MINT): FakeIx => ({
  programId: new PublicKey(TOKEN_PROGRAM),
  parsed: { type, info: { mint, ...info } },
})

const memoIx = (text: string): FakeIx => ({ programId: new PublicKey(MEMO_PROGRAM), parsed: text })

interface FakeTxOptions {
  instructions: FakeIx[]
  err?: unknown
  blockTime?: number | null
  accounts?: string[]
  preTokenBalances?: Array<{ accountIndex: number; mint: string; owner: string }>
}

function fakeTx(opts: FakeTxOptions): ParsedTransactionWithMeta {
  const accounts = opts.accounts ?? []
  return {
    blockTime: opts.blockTime === undefined ? Math.floor(Date.now() / 1000) : opts.blockTime,
    meta: {
      err: opts.err ?? null,
      innerInstructions: [],
      preTokenBalances: opts.preTokenBalances ?? [],
    },
    transaction: {
      message: {
        accountKeys: accounts.map((a) => ({ pubkey: new PublicKey(a) })),
        instructions: opts.instructions,
      },
    },
  } as unknown as ParsedTransactionWithMeta
}

const freshMemo = (wallet = WALLET): string => `graffiti:v1:${wallet}:${Math.floor(Date.now() / 1000)}`

describe('sumBurnsBy', () => {
  test('counts burns authorised by the wallet', () => {
    const tx = fakeTx({
      instructions: [burnIx({ authority: WALLET, tokenAmount: { amount: '7' } })],
    })
    assert.equal(sumBurnsBy(tx, WALLET, MINT), 7)
  })

  test('reads the plain `burn` amount shape too', () => {
    const tx = fakeTx({ instructions: [burnIx({ authority: WALLET, amount: '5' }, 'burn')] })
    assert.equal(sumBurnsBy(tx, WALLET, MINT), 5)
  })

  test("does not count someone else's burn in the same transaction", () => {
    const tx = fakeTx({
      instructions: [
        burnIx({ authority: OTHER, tokenAmount: { amount: '1000' } }),
        burnIx({ authority: WALLET, tokenAmount: { amount: '3' } }),
      ],
    })
    assert.equal(sumBurnsBy(tx, WALLET, MINT), 3, 'a co-signer must not be able to pay for the wallet')
  })

  test('ignores burns of other mints', () => {
    const tx = fakeTx({
      instructions: [burnIx({ authority: WALLET, tokenAmount: { amount: '50' } }, 'burnChecked', OTHER)],
    })
    assert.equal(sumBurnsBy(tx, WALLET, MINT), 0)
  })

  test('attributes a delegate burn to the owner of the source token account', () => {
    const source = Keypair.generate().publicKey.toBase58()
    const tx = fakeTx({
      instructions: [burnIx({ authority: OTHER, account: source, tokenAmount: { amount: '4' } })],
      accounts: [source],
      preTokenBalances: [{ accountIndex: 0, mint: MINT, owner: WALLET }],
    })
    assert.equal(sumBurnsBy(tx, WALLET, MINT), 4)
  })

  test('ignores non-burn token instructions and non-token programs', () => {
    const transfer = burnIx({ authority: WALLET, tokenAmount: { amount: '9' } }, 'transfer')
    const foreign: FakeIx = {
      programId: new PublicKey(MEMO_PROGRAM),
      parsed: { type: 'burn', info: { mint: MINT, authority: WALLET, amount: '9' } },
    }
    assert.equal(sumBurnsBy(fakeTx({ instructions: [transfer, foreign] }), WALLET, MINT), 0)
  })

  test('discards zero, negative and non-numeric amounts', () => {
    const tx = fakeTx({
      instructions: [
        burnIx({ authority: WALLET, tokenAmount: { amount: '0' } }),
        burnIx({ authority: WALLET, tokenAmount: { amount: '-4' } }),
        burnIx({ authority: WALLET, tokenAmount: { amount: 'abc' } }),
      ],
    })
    assert.equal(sumBurnsBy(tx, WALLET, MINT), 0)
  })
})

describe('findMemo', () => {
  test('accepts a fresh memo for the wallet', () => {
    const text = freshMemo()
    const res = findMemo(fakeTx({ instructions: [memoIx(text)] }), WALLET, 300)
    assert.deepEqual(res, { memo: text })
  })

  test("rejects a memo naming a different wallet, so one burn can't be reused by another", () => {
    const res = findMemo(fakeTx({ instructions: [memoIx(freshMemo(OTHER))] }), WALLET, 300)
    assert.ok('err' in res)
  })

  test('rejects a memo outside the freshness window', () => {
    const stale = `graffiti:v1:${WALLET}:${Math.floor(Date.now() / 1000) - 3600}`
    const res = findMemo(fakeTx({ instructions: [memoIx(stale)] }), WALLET, 300)
    assert.deepEqual(res, { err: 'memo ts outside freshness window' })
  })

  test('accepts millisecond timestamps', () => {
    const text = `graffiti:v1:${WALLET}:${Date.now()}`
    assert.deepEqual(findMemo(fakeTx({ instructions: [memoIx(text)] }), WALLET, 300), { memo: text })
  })

  test('reports a missing memo', () => {
    assert.ok('err' in findMemo(fakeTx({ instructions: [] }), WALLET, 300))
  })
})

describe('checkExecution', () => {
  test('passes a recent successful transaction', () => {
    assert.equal(checkExecution(fakeTx({ instructions: [] }), 300), null)
  })

  test('rejects a failed transaction as terminal', () => {
    const res = checkExecution(fakeTx({ instructions: [], err: { InstructionError: [0, 'Custom'] } }), 300)
    assert.equal(res?.ok, false)
    assert.equal(res?.retryable, false)
  })

  test('rejects a stale transaction', () => {
    const res = checkExecution(fakeTx({ instructions: [], blockTime: Math.floor(Date.now() / 1000) - 3600 }), 300)
    assert.match(res?.reason ?? '', /outside the 300s window/)
  })

  test('rejects a missing blockTime', () => {
    assert.equal(checkExecution(fakeTx({ instructions: [], blockTime: null }), 300)?.reason, 'missing blockTime')
  })
})

function makeVerifier(
  tx: ParsedTransactionWithMeta | null | Error,
  overrides: Partial<Config> = {},
): { verifier: DrawVerifier; store: JsonStore } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graffiti-verify-'))
  const store = new JsonStore(path.join(dir, 'test.db'))
  const config = {
    devInsecure: false,
    mint: MINT,
    rpcUrl: 'http://unused',
    verifyCommitment: 'finalized',
    txMaxAgeSec: 300,
    ...overrides,
  } as Config
  const rpc = {
    getParsedTransaction: async (): Promise<ParsedTransactionWithMeta | null> => {
      if (tx instanceof Error) throw tx
      return tx
    },
  }
  return { verifier: new DrawVerifier(config, store, rpc), store }
}

const validTx = (amount = '5'): ParsedTransactionWithMeta =>
  fakeTx({
    instructions: [burnIx({ authority: WALLET, tokenAmount: { amount } }), memoIx(freshMemo())],
  })

describe('DrawVerifier.verify', () => {
  test('accepts a valid burn', async () => {
    const { verifier } = makeVerifier(validTx())
    const res = await verifier.verify({ txSignature: 'sig-1', walletPubkey: WALLET, costCells: 5 })
    assert.equal(res.ok, true)
    assert.equal(res.ok && res.burned, 5)
  })

  test('rejects a replayed signature', async () => {
    const { verifier } = makeVerifier(validTx())
    const input = { txSignature: 'sig-replay', walletPubkey: WALLET, costCells: 5 }
    assert.equal((await verifier.verify(input)).ok, true)
    const second = await verifier.verify(input)
    assert.equal(second.ok, false)
    assert.equal(!second.ok && second.reason, 'signature already used')
  })

  test('rejects a reused memo even under a fresh signature', async () => {
    const memo = freshMemo()
    const tx = fakeTx({ instructions: [burnIx({ authority: WALLET, tokenAmount: { amount: '5' } }), memoIx(memo)] })
    const { verifier } = makeVerifier(tx)
    assert.equal((await verifier.verify({ txSignature: 'a', walletPubkey: WALLET, costCells: 5 })).ok, true)
    const second = await verifier.verify({ txSignature: 'b', walletPubkey: WALLET, costCells: 5 })
    assert.equal(!second.ok && second.reason, 'memo already used (replay)')
  })

  test('rejects an under-burn as terminal', async () => {
    const { verifier } = makeVerifier(validTx('2'))
    const res = await verifier.verify({ txSignature: 'sig-low', walletPubkey: WALLET, costCells: 5 })
    assert.equal(res.ok, false)
    assert.equal(!res.ok && res.retryable, false)
  })

  test('a transaction not visible yet is retryable, and frees the signature for the retry', async () => {
    const { verifier, store } = makeVerifier(null)
    const res = await verifier.verify({ txSignature: 'sig-pending', walletPubkey: WALLET, costCells: 5 })
    assert.equal(!res.ok && res.retryable, true)
    assert.equal(store.claimSignature('sig-pending'), true, 'the signature must not stay reserved')
  })

  test('an RPC error is retryable', async () => {
    const { verifier } = makeVerifier(new Error('socket hang up'))
    const res = await verifier.verify({ txSignature: 'sig-rpc', walletPubkey: WALLET, costCells: 5 })
    assert.equal(!res.ok && res.retryable, true)
    assert.match(!res.ok ? res.reason : '', /socket hang up/)
  })

  test('release() hands the burn back so a failed draw can be retried', async () => {
    const { verifier } = makeVerifier(validTx())
    const input = { txSignature: 'sig-release', walletPubkey: WALLET, costCells: 5 }
    const first = await verifier.verify(input)
    assert.equal(first.ok, true)
    if (first.ok) first.release()
    assert.equal((await verifier.verify(input)).ok, true)
  })

  test('refuses to run without a configured mint', async () => {
    const { verifier } = makeVerifier(validTx(), { mint: null })
    const res = await verifier.verify({ txSignature: 'sig-x', walletPubkey: WALLET, costCells: 5 })
    assert.match(!res.ok ? res.reason : '', /MINT not set/)
  })

  test('rejects an invalid wallet address', async () => {
    const { verifier } = makeVerifier(validTx())
    const res = await verifier.verify({ txSignature: 'sig-y', walletPubkey: 'nope', costCells: 5 })
    assert.equal(!res.ok && res.reason, 'invalid walletPubkey')
  })

  test('dev-insecure still tracks signatures', async () => {
    const { verifier } = makeVerifier(null, { devInsecure: true })
    const input = { txSignature: 'dev-1', walletPubkey: WALLET, costCells: 3 }
    assert.equal((await verifier.verify(input)).ok, true)
    assert.equal((await verifier.verify(input)).ok, false)
  })
})
