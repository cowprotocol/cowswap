import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { expect, type Page } from '@playwright/test'

import { test as mockWalletTest } from './mockWallet'

import { seedSolanaAutoConnect } from '../mockWallet/seedSolanaAutoConnect'
import { E2E_SOLANA_WALLET_INFO, solanaStandardShim } from '../mockWallet/solanaStandardShim'
import { createSolanaWalletEngine, type SolanaSignCallRecord } from '../mockWallet/solanaWalletEngine'

const SOLANA_CAIP_NETWORK_ID = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'

export interface MockSolanaWalletApi {
  readonly address: string
  openApp(opts?: { sell?: string; buy?: string }): Promise<void>
  connectViaModal(): Promise<void>
  /** Drops the wallet the way a user disconnecting inside their extension would. */
  disconnectInWallet(): Promise<void>
  signCalls(): SolanaSignCallRecord[]
}

interface MockSolanaWalletFixtures {
  solanaWallet: MockSolanaWalletApi
}

interface MockSolanaWalletOptions {
  solanaWalletSecretKey: string | undefined
  // When false, the fixture does not pre-seed reconnect state — the app boots with no Solana wallet
  // and specs drive `solanaWallet.connectViaModal()` themselves.
  solanaWalletAutoConnect: boolean
}

/**
 * Extends the EVM mock-wallet entrypoint rather than the shared fixtures directly, for two reasons:
 * `sharedFixtures` depends on a `wallet` handle for `setupTestConditions`, and dapp mode is exactly
 * the case where a host holds both namespaces at once. Set `mockWalletAutoConnect: false` for a spec
 * that wants Solana alone.
 */
export const test = mockWalletTest.extend<MockSolanaWalletFixtures & MockSolanaWalletOptions>({
  solanaWalletSecretKey: [undefined, { option: true }],
  solanaWalletAutoConnect: [true, { option: true }],
  // `auto: true` so the registration and reconnect seeding land for every test using this
  // entrypoint, whether or not the body touches the handle — Playwright is lazy otherwise.
  solanaWallet: [
    async ({ context, page, solanaWalletSecretKey, solanaWalletAutoConnect }, use) => {
      const engine = createSolanaWalletEngine({ secretKey: resolveSecretKey(solanaWalletSecretKey) })

      await context.exposeBinding('__e2eSolanaWalletSign', (_source, transactionsBase64: string[]) =>
        engine.signTransactions(transactionsBase64),
      )
      await context.addInitScript(solanaStandardShim, {
        ...E2E_SOLANA_WALLET_INFO,
        address: engine.address,
        publicKeyBase64: engine.publicKeyBase64,
      })
      if (solanaWalletAutoConnect) {
        await context.addInitScript(seedSolanaAutoConnect, {
          connectorId: E2E_SOLANA_WALLET_INFO.name,
          caipNetworkId: SOLANA_CAIP_NETWORK_ID,
        })
      }

      await use(createMockSolanaWalletApi(engine, page))
    },
    { auto: true },
  ],
})

function createMockSolanaWalletApi(
  engine: ReturnType<typeof createSolanaWalletEngine>,
  page: Page,
): MockSolanaWalletApi {
  return {
    get address() {
      return engine.address
    },
    async openApp({ sell = '', buy = '' } = {}) {
      await page.goto(`/#/${SupportedChainId.SOLANA}/swap/${sell}/${buy}`, { waitUntil: 'domcontentloaded' })
      await page.locator('#web3-status-connected').waitFor()
    },
    async connectViaModal() {
      // AppKit renders wallet entries as non-button rows, so match on text, not role.
      await page
        .getByRole('button', { name: /connect wallet/i })
        .first()
        .click()
      await page.getByText(new RegExp(E2E_SOLANA_WALLET_INFO.name, 'i')).first().click()
      await page.locator('#web3-status-connected').waitFor()
    },
    async disconnectInWallet() {
      await page.evaluate(() =>
        (window as never as { __e2eSolanaWalletDisconnect?(): void }).__e2eSolanaWalletDisconnect?.(),
      )
    },
    signCalls() {
      return engine.signCalls()
    },
  }
}

function resolveSecretKey(configured: string | undefined): string {
  const raw = configured ?? process.env.INTEGRATION_TEST_SOLANA_SECRET_KEY

  if (!raw) {
    throw new Error(
      'Solana mock wallet needs a secret key: set INTEGRATION_TEST_SOLANA_SECRET_KEY or test.use({ solanaWalletSecretKey })',
    )
  }

  return raw
}

export { expect }
