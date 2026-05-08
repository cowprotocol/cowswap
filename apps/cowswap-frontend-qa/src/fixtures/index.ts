import { test as base, expect } from '@playwright/test'

import {
  approveWethForCowVaultRelayer,
  createAnvilSnapshot,
  revertAnvilSnapshot,
  startAnvil,
  wrapEthToWeth,
} from './anvil'
import { setupBrowser } from './browser'
import { installInjectedWallet, TEST_WALLET_ADDRESS } from './wallet'

import type { Address } from 'viem'

interface QaTestFixtures {
  approveWethForCowVaultRelayer: (amount: bigint) => Promise<void>
  walletAddress: Address
  wrapNativeToWeth: (amount: bigint) => Promise<void>
}

interface QaWorkerFixtures {
  anvilUrl: string
}

export const test = base.extend<QaTestFixtures, QaWorkerFixtures>({
  anvilUrl: [
    async ({}, runFixture) => {
      const anvil = await startAnvil()

      try {
        await runFixture(anvil.url)
      } finally {
        await anvil.dispose()
      }
    },
    { scope: 'worker' },
  ],
  walletAddress: async ({}, runFixture) => {
    await runFixture(TEST_WALLET_ADDRESS)
  },
  approveWethForCowVaultRelayer: async ({ anvilUrl, walletAddress }, runFixture) => {
    await runFixture((amount) => approveWethForCowVaultRelayer({ amount, owner: walletAddress, rpcUrl: anvilUrl }))
  },
  wrapNativeToWeth: async ({ anvilUrl, walletAddress }, runFixture) => {
    await runFixture((amount) => wrapEthToWeth({ amount, owner: walletAddress, rpcUrl: anvilUrl }))
  },
  page: async ({ anvilUrl, page }, runFixture) => {
    const snapshotId = await createAnvilSnapshot(anvilUrl)

    await setupBrowser(page)
    await installInjectedWallet(page, { rpcUrl: anvilUrl })

    try {
      await runFixture(page)
    } finally {
      await revertAnvilSnapshot(anvilUrl, snapshotId)
    }
  },
})

export { expect }
