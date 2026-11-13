import { MINT_SIZE, MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { type Connection, Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, test } from 'node:test'

import { ClaimService } from './claims.js'
import { JsonStore } from './jsonStore.js'

import type { Config } from './config.js'

const MINT = Keypair.generate().publicKey.toBase58()
const WALLET = Keypair.generate().publicKey.toBase58()
const TREASURY = Keypair.generate()

type Behaviour = {
  send?: () => Promise<string>
  status?: () => Promise<{ value: SignatureStatusValue[] }>
}

type SignatureStatusValue = { err: unknown; confirmationStatus?: string } | null

const CONFIRMED: SignatureStatusValue = { err: null, confirmationStatus: 'confirmed' }

function mintAccount(): unknown {
  const data = Buffer.alloc(MINT_SIZE)
  MintLayout.encode(
    {
      mintAuthorityOption: 0,
      mintAuthority: PublicKey.default,
      supply: BigInt(1_000),
      decimals: 0,
      isInitialized: true,
      freezeAuthorityOption: 0,
      freezeAuthority: PublicKey.default,
    },
    data,
  )
  return { data, owner: TOKEN_PROGRAM_ID, executable: false, lamports: 1 }
}

function setup(
  behaviour: Behaviour = {},
  overrides: Partial<Config> = {},
): { service: ClaimService; store: JsonStore; sent: number[] } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'graffiti-claims-'))
  const store = new JsonStore(path.join(dir, 'test.db'))
  const sent: number[] = []
  const config = {
    devInsecure: false,
    mint: MINT,
    treasurySecretKey: bs58.encode(TREASURY.secretKey),
    treasuryKeypairPath: null,
    rpcUrl: 'http://unused',
    claimConfirmTimeoutMs: 5_000,
    ...overrides,
  } as Config
  const rpc = {
    getAccountInfo: async () => mintAccount(),
    getLatestBlockhash: async () => ({ blockhash: '11111111111111111111111111111111', lastValidBlockHeight: 100 }),
    sendTransaction: async () => {
      sent.push(Date.now())
      return (behaviour.send ?? (async () => 'sig-ok'))()
    },
    getSignatureStatuses: behaviour.status ?? (async () => ({ value: [CONFIRMED] })),
  } as unknown as Connection
  return { service: new ClaimService(config, store, rpc), store, sent }
}

describe('ClaimService.claim', () => {
  test('settles a claim and records the transaction signature', async () => {
    const { service, store } = setup()
    store.insertClaim('c1', 1000)

    const res = await service.claim('c1', WALLET)

    assert.deepEqual(res, { ok: true, txSignature: 'sig-ok', amount: 1000 })
    assert.equal(store.getClaim('c1')?.state, 'used')
    assert.equal(store.getClaim('c1')?.txSignature, 'sig-ok')
  })

  test('a second claim on a used code is rejected and sends nothing', async () => {
    const { service, store, sent } = setup()
    store.insertClaim('c2', 1000)
    await service.claim('c2', WALLET)

    const again = await service.claim('c2', WALLET)

    assert.equal(again.ok, false)
    assert.equal(sent.length, 1, 'the treasury must pay once')
  })

  test('concurrent claims of one code pay only once', async () => {
    const { service, store, sent } = setup()
    store.insertClaim('c3', 1000)

    const results = await Promise.all([service.claim('c3', WALLET), service.claim('c3', WALLET)])

    assert.equal(results.filter((r) => r.ok).length, 1)
    assert.equal(sent.length, 1)
  })

  test('a failure before submission releases the code for a retry', async () => {
    const { service, store } = setup({
      send: async () => {
        throw new Error('blockhash not found')
      },
    })
    store.insertClaim('c4', 1000)

    const res = await service.claim('c4', WALLET)

    assert.equal(res.ok, false)
    assert.equal(store.getClaim('c4')?.state, 'unused')
  })

  test('an unconfirmed transfer is parked as failed, never released', async () => {
    const { service, store } = setup({ status: async () => ({ value: [null] }) }, { claimConfirmTimeoutMs: 0 })
    store.insertClaim('c5', 1000)

    const res = await service.claim('c5', WALLET)

    assert.equal(res.ok, false)
    assert.equal(store.getClaim('c5')?.state, 'failed', 'it may still land, so it must not be re-armed')
    assert.match(store.getClaim('c5')?.failureReason ?? '', /unconfirmed sig-ok/)
    assert.equal((await service.claim('c5', WALLET)).ok, false, 'a parked code must not be claimable again')
  })

  test('a transfer that landed and failed on-chain releases the code', async () => {
    const { service, store } = setup({
      status: async () => ({ value: [{ err: { InstructionError: [1, 'Custom'] }, confirmationStatus: 'confirmed' }] }),
    })
    store.insertClaim('c6', 1000)

    const res = await service.claim('c6', WALLET)

    assert.equal(res.ok, false)
    assert.equal(store.getClaim('c6')?.state, 'unused')
  })

  test('a transfer that only reaches processed is not treated as confirmed', async () => {
    const { service, store } = setup(
      { status: async () => ({ value: [{ err: null, confirmationStatus: 'processed' }] }) },
      { claimConfirmTimeoutMs: 0 },
    )
    store.insertClaim('c10', 1000)

    const res = await service.claim('c10', WALLET)

    assert.equal(res.ok, false)
    assert.equal(store.getClaim('c10')?.state, 'failed')
  })

  test('confirmation polls until the status shows up', async () => {
    let polls = 0
    const { service, store } = setup({
      status: async () => {
        polls++
        return { value: [polls < 2 ? null : CONFIRMED] }
      },
    })
    store.insertClaim('c11', 1000)

    const res = await service.claim('c11', WALLET)

    assert.equal(res.ok, true)
    assert.ok(polls >= 2, 'a transfer not yet visible must be polled again, not failed')
    assert.equal(store.getClaim('c11')?.state, 'used')
  })

  test('a transient RPC error does not fail a transfer that then confirms', async () => {
    let polls = 0
    const { service, store } = setup({
      status: async () => {
        polls++
        if (polls < 2) throw new Error('502 Bad Gateway')
        return { value: [CONFIRMED] }
      },
    })
    store.insertClaim('c12', 1000)

    const res = await service.claim('c12', WALLET)

    assert.equal(res.ok, true)
    assert.equal(store.getClaim('c12')?.state, 'used')
  })

  test('an unknown code is a 404', async () => {
    const { service } = setup()
    const res = await service.claim('nope', WALLET)
    assert.equal(!res.ok && res.status, 404)
  })

  test('an invalid wallet is rejected without consuming the code', async () => {
    const { service, store } = setup()
    store.insertClaim('c7', 1000)

    const res = await service.claim('c7', 'not-a-key')

    assert.equal(!res.ok && res.status, 400)
    assert.equal(store.getClaim('c7')?.state, 'unused')
  })

  test('a misconfigured server does not burn through codes', async () => {
    const { service, store } = setup({}, { mint: null })
    store.insertClaim('c8', 1000)

    const res = await service.claim('c8', WALLET)

    assert.equal(!res.ok && res.status, 500)
    assert.equal(store.getClaim('c8')?.state, 'unused')
  })

  test('dev-insecure settles without touching the chain', async () => {
    const { service, store, sent } = setup({}, { devInsecure: true, mint: null, treasurySecretKey: null })
    store.insertClaim('c9', 1000)

    const res = await service.claim('c9', WALLET)

    assert.equal(res.ok, true)
    assert.equal(sent.length, 0)
    assert.equal(store.getClaim('c9')?.state, 'used')
  })
})
