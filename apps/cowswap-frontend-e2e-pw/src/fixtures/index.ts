import { expect } from '@playwright/test'

import { createRpcProxyHandle, type RpcProxyHandle } from './rpcProxy'
import { createWalletApi, type WalletApi } from './wallet'

import { installBff, type BffMock } from '../mocks/bff'
import { installCowOrderApi, type CowOrderApiMock } from '../mocks/cowOrderApi'
import { installTokenLists, type TokenListsMock } from '../mocks/tokenLists'
import { ConfirmModal } from '../pages/ConfirmModal'
import { SwapPage } from '../pages/SwapPage'
import { synpressTest } from '../support/synpress'

interface E2EFixtures {
  wallet: WalletApi
  swapPage: SwapPage
  confirmModal: ConfirmModal
  rpcProxy: RpcProxyHandle
  mocks: {
    cowOrderApi: CowOrderApiMock
    bff: BffMock
    tokenLists: TokenListsMock
  }
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

  rpcProxy: async ({}, use, testInfo) => {
    const handle = createRpcProxyHandle(testInfo)
    await handle.reset()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(handle)
    await handle.reset()
  },
  mocks: async ({ context, page }, use) => {
    const cowOrderApi = installCowOrderApi(context, page)
    const bff = installBff(context)
    const tokenLists = installTokenLists(context)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({ cowOrderApi, bff, tokenLists })
    bff.reset()
    tokenLists.reset()
    await cowOrderApi.reset()
  },
})

export { expect }
