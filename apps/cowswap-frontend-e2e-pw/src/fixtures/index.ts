import { expect } from '@playwright/test'

import { createWalletApi, type WalletApi } from './wallet'

import { installCowOrderApi, type CowOrderApiMock } from '../mocks/cowOrderApi'
import { ConfirmModal } from '../pages/ConfirmModal'
import { SwapPage } from '../pages/SwapPage'
import { synpressTest } from '../support/synpress'

interface E2EFixtures {
  wallet: WalletApi
  swapPage: SwapPage
  confirmModal: ConfirmModal
  mocks: { cowOrderApi: CowOrderApiMock }
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
  mocks: async ({ context, page }, use) => {
    const cowOrderApi = installCowOrderApi(context, page)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({ cowOrderApi })
    await cowOrderApi.reset()
  },
})

export { expect }
