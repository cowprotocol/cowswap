import { createRpcProxyHandle, type RpcProxyHandle } from './rpcProxy'

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

import type { Fixtures, PlaywrightTestArgs, PlaywrightTestOptions } from '@playwright/test'

export interface SharedFixtures {
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

/* eslint-disable react-hooks/rules-of-hooks */
export const sharedFixtures: Fixtures<SharedFixtures, object, PlaywrightTestArgs & PlaywrightTestOptions> = {
  swapPage: async ({ page }, use) => {
    await use(new SwapPage(page))
  },
  limitPage: async ({ page }, use) => {
    await use(new LimitPage(page))
  },
  twapPage: async ({ page }, use) => {
    await use(new TwapPage(page))
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page))
  },
  confirmModal: async ({ page }, use) => {
    await use(new ConfirmModal(page))
  },
  rpcProxy: async ({}, use, testInfo) => {
    const handle = createRpcProxyHandle(testInfo)
    await handle.reset()
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
    await use({ cowOrderApi, bff, tokenLists, safeSdk, bungee, nearIntents })
    bff.reset()
    tokenLists.reset()
    bungee.reset()
    nearIntents.reset()
    await safeSdk.disable()
    await cowOrderApi.reset()
  },
}
/* eslint-enable react-hooks/rules-of-hooks */
