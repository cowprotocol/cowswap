import { expect } from '@playwright/test'

import { createWalletApi, type WalletApi } from './wallet'

import { synpressTest } from '../support/synpress'

interface E2EFixtures {
  wallet: WalletApi
}

export const test = synpressTest.extend<E2EFixtures>({
  wallet: async ({ metamask, page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(createWalletApi(metamask, page))
  },
})

export { expect }
