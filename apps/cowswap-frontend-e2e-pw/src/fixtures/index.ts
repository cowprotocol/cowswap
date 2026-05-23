import { expect } from '@playwright/test'

import { createRpcProxyHandle, type RpcProxyHandle } from './rpcProxy'
import { createWalletApi, type WalletApi } from './wallet'

import { installBff, type BffMock } from '../mocks/bff'
import { installBungee, type BungeeMock } from '../mocks/bungee'
import { installCowOrderApi, type CowOrderApiMock } from '../mocks/cowOrderApi'
import { installNearIntents, type NearIntentsMock } from '../mocks/nearIntents'
import { installSafeSdk, type SafeSdkMock } from '../mocks/safeSdk'
import { installTokenLists, type TokenListsMock } from '../mocks/tokenLists'
import { AccountPage } from '../pages/AccountPage'
import { ConfirmModal } from '../pages/ConfirmModal'
import { LimitPage } from '../pages/LimitPage'
import { SwapPage } from '../pages/SwapPage'
import { TwapPage } from '../pages/TwapPage'
import { synpressTest } from '../support/synpress'

interface E2EFixtures {
  wallet: WalletApi
  swapPage: SwapPage
  limitPage: LimitPage
  twapPage: TwapPage
  accountPage: AccountPage
  confirmModal: ConfirmModal
  rpcProxy: RpcProxyHandle
  mocks: {
    cowOrderApi: CowOrderApiMock
    bff: BffMock
    tokenLists: TokenListsMock
    safeSdk: SafeSdkMock
    bungee: BungeeMock
    nearIntents: NearIntentsMock
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
  limitPage: async ({ page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(new LimitPage(page))
  },
  twapPage: async ({ page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(new TwapPage(page))
  },
  accountPage: async ({ page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(new AccountPage(page))
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
    const safeSdk = installSafeSdk(context)
    const bungee = installBungee(context)
    const nearIntents = installNearIntents(context)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({ cowOrderApi, bff, tokenLists, safeSdk, bungee, nearIntents })
    bff.reset()
    tokenLists.reset()
    bungee.reset()
    nearIntents.reset()
    await safeSdk.disable()
    await cowOrderApi.reset()
  },
})

export { expect }
