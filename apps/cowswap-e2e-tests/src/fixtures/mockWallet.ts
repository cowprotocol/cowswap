import { toHex, type Hex } from 'viem'

import { expect, test as base, type Page } from '@playwright/test'

import { sharedFixtures, type SharedFixtures } from './shared'

import { E2E_WALLET_INFO, injectedShim } from '../mockWallet/injectedShim'
import { seedAutoConnect } from '../mockWallet/seedAutoConnect'
import { createWalletEngine, type RpcCallRecord, type RpcStub, type WalletEngine } from '../mockWallet/walletEngine'
import { CHAIN_IDS, type SupportedChainId } from '../support/constants'

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

function createMockWalletApi(engine: WalletEngine, page: Page): MockWalletApi {
  return {
    get address() {
      return engine.address
    },
    async openApp({ chainId, sell = '', buy = '' }) {
      engine.setChainId(chainId)
      await page.goto(`/#/${chainId}/swap/${sell}/${buy}`, { waitUntil: 'domcontentloaded' })
      await page.locator('#web3-status-connected').waitFor({ timeout: 15_000 })
    },
    async switchChain(chainId) {
      engine.setChainId(chainId)
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
        chainId: CHAIN_IDS.SEPOLIA,
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
        chainIdHex: toHex(CHAIN_IDS.SEPOLIA),
      })
      if (mockWalletAutoConnect) {
        await context.addInitScript(seedAutoConnect, {
          rdns: E2E_WALLET_INFO.rdns,
          defaultChainId: CHAIN_IDS.SEPOLIA,
        })
      }

      await use(createMockWalletApi(engine, page))
    },
    { auto: true },
  ],
})

export { expect }
