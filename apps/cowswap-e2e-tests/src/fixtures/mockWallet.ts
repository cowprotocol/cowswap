import { toHex, type Hex } from 'viem'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { expect, test as base, type BrowserContext, type Page } from '@playwright/test'

import { sharedFixtures, type SharedFixtures } from './shared'

import { E2E_WALLET_INFO, injectedShim } from '../mockWallet/injectedShim'
import { seedAutoConnect } from '../mockWallet/seedAutoConnect'
import { createWalletEngine, type RpcCallRecord, type RpcStub, type WalletEngine } from '../mockWallet/walletEngine'

export interface MockWalletApi {
  readonly address: string
  openApp(opts: { chainId: SupportedChainId; sell?: string; buy?: string }): Promise<void>
  switchChain(chainId: SupportedChainId): Promise<void>
  connectViaModal(): Promise<void>
  stubRpc(method: string, handler: RpcStub | unknown): void
  restoreRpc(method: string): void
  rpcCalls(method?: string): RpcCallRecord[]
}

interface MockWalletFixtures extends SharedFixtures {
  wallet: MockWalletApi
}

interface MockWalletOptions {
  mockWalletKey: Hex | undefined
  // When false, the fixture does not pre-seed reconnect state — the app boots
  // disconnected and specs drive `wallet.connectViaModal()` themselves.
  mockWalletAutoConnect: boolean
}

function createMockWalletApi(engine: WalletEngine, page: Page, context: BrowserContext): MockWalletApi {
  return {
    get address() {
      return engine.address
    },
    async openApp({ chainId, sell = '', buy = '' }) {
      engine.setChainId(chainId)
      // `setChainId`'s `chainChanged` emit targets the page that's about to be discarded by the
      // `goto` below — it's lost, not just delayed, so the fresh document must never rely on it.
      // Every `addInitScript` call re-seeds `window.ethereum` with a snapshot of `chainIdHex` taken
      // at registration time (`injectedShim`'s `cfg` is frozen, not a live reference to `engine`),
      // so the ORIGINAL registration in the `wallet` fixture below — always Sepolia — is what a
      // fresh navigation actually sees unless re-registered here with the real target chain first.
      await context.addInitScript(injectedShim, {
        ...E2E_WALLET_INFO,
        address: engine.address,
        chainIdHex: toHex(chainId),
      })
      await page.goto(`/#/${chainId}/swap/${sell}/${buy}`, { waitUntil: 'domcontentloaded' })
      await page.locator('#web3-status-connected').waitFor({ timeout: 15_000 })
    },
    async switchChain(chainId) {
      engine.setChainId(chainId)
      // Same staleness risk as `openApp` for whatever navigation comes next (e.g. a later
      // `page.reload()`), even though the live `chainChanged` emit above already updates the
      // currently-loaded document correctly.
      await context.addInitScript(injectedShim, {
        ...E2E_WALLET_INFO,
        address: engine.address,
        chainIdHex: toHex(chainId),
      })
    },
    async connectViaModal() {
      // The mock wallet surfaces in the AppKit modal via EIP-6963 as "E2E Wallet".
      // AppKit renders wallet entries as non-button rows, so match on text, not role.
      await page
        .getByRole('button', { name: /connect wallet/i })
        .first()
        .click()
      await page
        .getByText(/e2e wallet/i)
        .first()
        .click()
      await page.locator('#web3-status-connected').waitFor({ timeout: 15_000 })
    },
    stubRpc(method, handler) {
      engine.stubRpc(method, handler)
    },
    restoreRpc(method) {
      engine.restoreRpc(method)
    },
    rpcCalls(method) {
      return engine.rpcCalls(method)
    },
  }
}

function resolvePrivateKey(mockWalletKey: Hex | undefined): Hex {
  const raw = mockWalletKey ?? process.env.INTEGRATION_TEST_PRIVATE_KEY
  if (!raw) {
    throw new Error('Mock wallet needs a private key: set INTEGRATION_TEST_PRIVATE_KEY or test.use({ mockWalletKey })')
  }
  return (raw.startsWith('0x') ? raw : `0x${raw}`) as Hex
}

export const test = base.extend<MockWalletFixtures & MockWalletOptions>({
  ...sharedFixtures,
  mockWalletKey: [undefined, { option: true }],
  mockWalletAutoConnect: [true, { option: true }],
  // `auto: true` so the injected provider and auto-connect seeding are installed for every
  // test using this entrypoint — the app boots connected whether or not the test body ever
  // touches the `wallet` handle (Playwright instantiates fixtures lazily otherwise).
  wallet: [
    async ({ context, page, mockWalletKey, mockWalletAutoConnect }, use) => {
      const engine = createWalletEngine({
        privateKey: resolvePrivateKey(mockWalletKey),
        chainId: SupportedChainId.SEPOLIA,
        emit: (event, payload) => {
          page
            .evaluate(
              ([e, p]) =>
                (window as never as { __e2eWalletEmit?(ev: unknown, pl: unknown): void }).__e2eWalletEmit?.(e, p),
              [event, payload] as const,
            )
            .catch(() => undefined) // page may be navigating; event loss is acceptable mid-teardown
        },
      })

      await context.exposeBinding('__e2eWalletRequest', (_source, req: { method: string; params?: unknown[] }) =>
        engine.handleRequest(req),
      )
      await context.addInitScript(injectedShim, {
        ...E2E_WALLET_INFO,
        address: engine.address,
        chainIdHex: toHex(SupportedChainId.SEPOLIA),
      })
      if (mockWalletAutoConnect) {
        await context.addInitScript(seedAutoConnect, {
          rdns: E2E_WALLET_INFO.rdns,
          defaultChainId: SupportedChainId.SEPOLIA,
        })
      }

      await use(createMockWalletApi(engine, page, context))
    },
    { auto: true },
  ],
})

export { expect }
