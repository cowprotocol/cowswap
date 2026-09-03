import { expect } from '@playwright/test'

import { sharedFixtures, type SharedFixtures } from './shared'
import { createWalletApi, type WalletApi } from './wallet'

import { synpressTest } from '../support/synpress'

interface E2EFixtures extends SharedFixtures {
  wallet: WalletApi
}

export const test = synpressTest.extend<E2EFixtures>({
  ...sharedFixtures,
  wallet: async ({ metamask, page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(createWalletApi(metamask, page))
  },
})

export { expect }
