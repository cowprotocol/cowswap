import { expect } from '@playwright/test'

import { createWalletApi, type WalletApi } from './wallet'

import { ConfirmModal } from '../pages/ConfirmModal'
import { SwapPage } from '../pages/SwapPage'
import { synpressTest } from '../support/synpress'

interface E2EFixtures {
  wallet: WalletApi
  swapPage: SwapPage
  confirmModal: ConfirmModal
}

export const test = synpressTest.extend<E2EFixtures>({
  wallet: async ({ metamask, page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(createWalletApi(metamask, page))
  },
  swapPage: async ({ page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(new SwapPage(page))
  },
  confirmModal: async ({ page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(new ConfirmModal(page))
  },
})

export { expect }
