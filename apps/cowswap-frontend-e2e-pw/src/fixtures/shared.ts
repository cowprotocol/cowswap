import { createRpcProxyHandle, type RpcProxyHandle } from './rpcProxy'

import { installAllowances, type AllowancesMock } from '../mocks/allowances'
import { installBalances, type BalancesMock } from '../mocks/balances'
import { installBungee, type BungeeMock } from '../mocks/bungee'
import { installCowProtocolApi, type CowProtocolApiMock } from '../mocks/cowProtocolApi'
import { installNearIntents, type NearIntentsMock } from '../mocks/nearIntents'
import { installSafeSdk, type SafeSdkMock } from '../mocks/safeSdk'
import { installTokenLists, type TokenListsMock } from '../mocks/tokenLists'
import { AccountPage } from '../pages/AccountPage'
import { ConfirmModal } from '../pages/ConfirmModal'
import { LimitPage } from '../pages/LimitPage'
import { SwapPage } from '../pages/SwapPage'
import { TwapPage } from '../pages/TwapPage'
import { createSetupTestConditions, type SetupTestConditions } from '../support/setupTestConditions'

import type { Fixtures, PlaywrightTestArgs, PlaywrightTestOptions } from '@playwright/test'

export interface SharedFixtures {
  swapPage: SwapPage
  limitPage: LimitPage
  twapPage: TwapPage
  accountPage: AccountPage
  confirmModal: ConfirmModal
  rpcProxy: RpcProxyHandle
  setupTestConditions: SetupTestConditions
  mocks: {
    allowances: AllowancesMock
    balances: BalancesMock
    cowApi: CowProtocolApiMock
    tokenLists: TokenListsMock
    safeSdk: SafeSdkMock
    bungee: BungeeMock
    nearIntents: NearIntentsMock
  }
}

/** The subset of `wallet` (MockWalletApi | WalletApi) that `setupTestConditions` needs. */
interface WalletLike {
  readonly address: string
}

/* eslint-disable react-hooks/rules-of-hooks */
export const sharedFixtures: Fixtures<
  SharedFixtures,
  object,
  PlaywrightTestArgs & PlaywrightTestOptions & { wallet: WalletLike }
> = {
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
  setupTestConditions: async ({ wallet, mocks, swapPage, limitPage, twapPage }, use) => {
    await use(createSetupTestConditions({ wallet, mocks, swapPage, limitPage, twapPage }))
  },
  rpcProxy: async ({}, use, testInfo) => {
    const handle = createRpcProxyHandle(testInfo)
    await handle.reset()
    await use(handle)
    await handle.reset()
  },
  // `auto: true`: nothing destructures `mocks` directly anymore (Task 4 dropped the last two
  // call sites), but every test still needs the CoW API lockdown installed and asserted at
  // teardown. A plain (non-auto) fixture is only set up when requested, so without this the
  // whole mock stack — including `assertNoUnmatched()` — would silently never run.
  mocks: [
    async ({ context }, use) => {
      const allowances = installAllowances(context)
      const balances = installBalances(context)
      const cowApi = installCowProtocolApi(context)
      const tokenLists = installTokenLists(context)
      const safeSdk = installSafeSdk(context)
      const bungee = installBungee(context)
      const nearIntents = installNearIntents(context)

      await use({ allowances, balances, cowApi, tokenLists, safeSdk, bungee, nearIntents })

      tokenLists.reset()
      bungee.reset()
      nearIntents.reset()
      await safeSdk.disable()
      // Non-fatal, so it must run before the throwing assert below.
      allowances.reportUnknownOwners()
      allowances.reset()
      balances.reportUnknownOwners()
      balances.reset()
      // Runs last: it throws when the test hit an un-mocked CoW API URL, and the
      // resets above must still happen.
      try {
        cowApi.assertNoUnmatched()
      } finally {
        cowApi.reset()
      }
    },
    { auto: true },
  ],
}
/* eslint-enable react-hooks/rules-of-hooks */
