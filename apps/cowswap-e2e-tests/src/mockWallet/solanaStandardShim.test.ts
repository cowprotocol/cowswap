import { strict as assert } from 'node:assert'
import { afterEach, beforeEach, test } from 'node:test'

import { E2E_SOLANA_WALLET_INFO, solanaStandardShim, type SolanaStandardShimConfig } from './solanaStandardShim'

const ADDRESS = 'So11111111111111111111111111111111111111112'
const PUBLIC_KEY = Buffer.from(Array.from({ length: 32 }, (_, index) => index + 1))

interface RegisteredWallet {
  version: string
  name: string
  icon: string
  chains: string[]
  accounts: readonly WalletAccountLike[]
  features: Record<string, Record<string, unknown>>
}

interface WalletAccountLike {
  address: string
  publicKey: Uint8Array
  chains: string[]
  features: string[]
}

const originalGlobals = {
  window: Reflect.get(globalThis, 'window') as unknown,
  atob: Reflect.get(globalThis, 'atob') as unknown,
  btoa: Reflect.get(globalThis, 'btoa') as unknown,
}

let signRequests: string[][]
let signResponses: string[]
let listeners: Map<string, Array<(event: unknown) => void>>
let dispatched: Array<{ type: string; detail: unknown }>

function installFakeWindow(): void {
  listeners = new Map()
  dispatched = []

  const fakeWindow = {
    addEventListener(type: string, listener: (event: unknown) => void) {
      const existing = listeners.get(type) ?? []
      existing.push(listener)
      listeners.set(type, existing)
    },
    dispatchEvent(event: { type: string; detail: unknown }) {
      dispatched.push({ type: event.type, detail: event.detail })

      return true
    },
    __e2eSolanaWalletSign(transactionsBase64: string[]) {
      signRequests.push(transactionsBase64)

      return Promise.resolve(signResponses)
    },
  }

  Reflect.set(globalThis, 'window', fakeWindow)
  // The shim builds a CustomEvent; Node 22 has one, but it carries `detail` only via the init bag.
  Reflect.set(
    globalThis,
    'CustomEvent',
    class {
      readonly type: string
      readonly detail: unknown
      constructor(type: string, init?: { detail?: unknown }) {
        this.type = type
        this.detail = init?.detail
      }
    },
  )
}

function registerShim(overrides: Partial<SolanaStandardShimConfig> = {}): RegisteredWallet {
  solanaStandardShim({
    ...E2E_SOLANA_WALLET_INFO,
    address: ADDRESS,
    publicKeyBase64: PUBLIC_KEY.toString('base64'),
    ...overrides,
  })

  const event = dispatched.find(({ type }) => type === 'wallet-standard:register-wallet')
  assert.ok(event, 'the shim dispatches wallet-standard:register-wallet')

  let registered: RegisteredWallet | undefined
  ;(event.detail as (api: { register(wallet: unknown): void }) => void)({
    register: (wallet) => {
      registered = wallet as RegisteredWallet
    },
  })

  assert.ok(registered, 'the register callback hands over a wallet')

  return registered
}

beforeEach(() => {
  signRequests = []
  signResponses = []
  installFakeWindow()
})

afterEach(() => {
  Reflect.set(globalThis, 'window', originalGlobals.window)
  Reflect.set(globalThis, 'atob', originalGlobals.atob)
  Reflect.set(globalThis, 'btoa', originalGlobals.btoa)
})

test('registers a wallet Reown will accept', () => {
  const wallet = registerShim()

  // `watchStandard` filters with `isWalletAdapterCompatibleStandardWallet`, which requires exactly
  // these: standard:connect, standard:events, and one of the two signing features.
  assert.ok('standard:connect' in wallet.features)
  assert.ok('standard:events' in wallet.features)
  assert.ok('solana:signTransaction' in wallet.features)
})

test('also registers when the app announces itself after the shim ran', () => {
  registerShim()

  const appReady = listeners.get('wallet-standard:app-ready')

  assert.equal(appReady?.length, 1, 'a late app still finds the wallet')
})

test('advertises the Wallet Standard chain id, not the CAIP one', () => {
  const wallet = registerShim()

  assert.deepEqual(wallet.chains, ['solana:mainnet'])
})

test('exposes no account until connect resolves', async () => {
  const wallet = registerShim()

  assert.deepEqual(wallet.accounts, [])

  const connect = wallet.features['standard:connect']?.['connect'] as () => Promise<{
    accounts: readonly WalletAccountLike[]
  }>
  const { accounts } = await connect()

  assert.equal(accounts.length, 1)
  assert.equal(accounts[0]?.address, ADDRESS)
  assert.deepEqual(Array.from(accounts[0]?.publicKey ?? []), Array.from(PUBLIC_KEY))
  assert.equal(wallet.accounts.length, 1, 'the wallet reports the account too')
})

test('clears the account on disconnect and tells listeners', async () => {
  const wallet = registerShim()

  const connect = wallet.features['standard:connect']?.['connect'] as () => Promise<unknown>
  const disconnect = wallet.features['standard:disconnect']?.['disconnect'] as () => Promise<void>
  const on = wallet.features['standard:events']?.['on'] as (
    event: string,
    listener: (properties: { accounts: readonly WalletAccountLike[] }) => void,
  ) => () => void

  const changes: number[] = []
  on('change', ({ accounts }) => changes.push(accounts.length))

  await connect()
  await disconnect()

  assert.deepEqual(changes, [1, 0])
  assert.deepEqual(wallet.accounts, [])
})

test('routes signing through the Node binding and round-trips base64', async () => {
  const wallet = registerShim()
  const unsigned = Uint8Array.from([1, 2, 3, 4])
  const signed = Buffer.from([9, 8, 7])
  signResponses = [signed.toString('base64')]

  const signTransaction = wallet.features['solana:signTransaction']?.['signTransaction'] as (
    ...inputs: readonly { transaction: Uint8Array }[]
  ) => Promise<readonly { signedTransaction: Uint8Array }[]>

  const results = await signTransaction({ transaction: unsigned })

  assert.deepEqual(signRequests, [[Buffer.from(unsigned).toString('base64')]])
  assert.deepEqual(Array.from(results[0]?.signedTransaction ?? []), Array.from(signed))
})

test('signs a batch in one variadic call, the way signAllTransactions arrives', async () => {
  const wallet = registerShim()
  signResponses = [Buffer.from([1]).toString('base64'), Buffer.from([2]).toString('base64')]

  const signTransaction = wallet.features['solana:signTransaction']?.['signTransaction'] as (
    ...inputs: readonly { transaction: Uint8Array }[]
  ) => Promise<readonly { signedTransaction: Uint8Array }[]>

  const results = await signTransaction({ transaction: Uint8Array.from([10]) }, { transaction: Uint8Array.from([20]) })

  assert.equal(signRequests.length, 1, 'one bridge call, not one per transaction')
  assert.equal(signRequests[0]?.length, 2)
  assert.equal(results.length, 2)
})
