import { installAllowances, type AllowancesMock } from '../mocks/allowances'
import { installBalances, type BalancesMock } from '../mocks/balances'
import { installBungee, type BungeeMock } from '../mocks/bridge/bungee'
import { installNearIntents, type NearIntentsMock } from '../mocks/bridge/nearIntents'
import { installSocketVerifier } from '../mocks/bridge/socketVerifier'
import { installCowProtocolApi, type CowProtocolApiMock } from '../mocks/cowProtocolApi'
import { installLaunchDarkly, type LaunchDarklyMock } from '../mocks/launchDarkly'
import { installEthBlockNumber } from '../mocks/nodeRpc/ethBlockNumber'
import { installEthEstimateGas } from '../mocks/nodeRpc/ethEstimateGas'
import { installEthGetCode, type EthGetCodeMock } from '../mocks/nodeRpc/ethGetCode'
import { installEthGetTransactionCount } from '../mocks/nodeRpc/ethGetTransactionCount'
import { installTokenNonce } from '../mocks/nodeRpc/tokenNonce'
import { installOrdersMock, type OrdersMock } from '../mocks/orders'
import { installSafeSdk, type SafeSdkMock } from '../mocks/safeSdk'
import { installUsdPrices, type UsdPricesMock } from '../mocks/usdPrices'
import { AccountModal } from '../pages/AccountModal'
import { AccountPage } from '../pages/AccountPage'
import { ConfirmModal } from '../pages/ConfirmModal'
import { HeaderPage } from '../pages/HeaderPage'
import { LimitPage } from '../pages/LimitPage'
import { SwapPage } from '../pages/SwapPage'
import { TwapPage } from '../pages/TwapPage'
import { logUnmockedRpcRequests } from '../support/logUnmockedRpcRequests'
import { mockApproveSimulation } from '../support/mockApproveSimulation'
import { createSetupTestConditions, type SetupTestConditions } from '../support/setupTestConditions'

import type { Fixtures, PlaywrightTestArgs, PlaywrightTestOptions } from '@playwright/test'

export interface SharedFixtures {
  swapPage: SwapPage
  limitPage: LimitPage
  twapPage: TwapPage
  accountPage: AccountPage
  accountModal: AccountModal
  confirmModal: ConfirmModal
  header: HeaderPage
  rpcProxy: unknown
  setupTestConditions: SetupTestConditions
  mocks: {
    allowances: AllowancesMock
    balances: BalancesMock
    cowApi: CowProtocolApiMock
    orders: OrdersMock
    ethGetCode: EthGetCodeMock
    safeSdk: SafeSdkMock
    bungee: BungeeMock
    nearIntents: NearIntentsMock
    launchDarkly: LaunchDarklyMock
    usdPrices: UsdPricesMock
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
  accountModal: async ({ page }, use) => {
    await use(new AccountModal(page))
  },
  confirmModal: async ({ page }, use) => {
    await use(new ConfirmModal(page))
  },
  header: async ({ page }, use) => {
    await use(new HeaderPage(page))
  },
  setupTestConditions: async ({ wallet, mocks, swapPage, limitPage, twapPage }, use) => {
    await use(createSetupTestConditions({ wallet, mocks, swapPage, limitPage, twapPage }))
  },
  rpcProxy: undefined,
  // `auto: true`: nothing destructures `mocks` directly anymore (Task 4 dropped the last two
  // call sites), but every test still needs the CoW API lockdown installed and asserted at
  // teardown. A plain (non-auto) fixture is only set up when requested, so without this the
  // whole mock stack — including `assertNoUnmatched()` — would silently never run.
  mocks: [
    async ({ context }, use, testInfo) => {
      // Diagnostic-only, opt-in via `LOG_UNMOCKED_RPC=1` — see `logUnmockedRpcRequests`'s own doc
      // comment. Registered before every other mock below (and therefore before any manually
      // installed one too, e.g. `mockApproveTransaction`, since those only get added once the test
      // body starts running) so it only ever sees requests nothing else claimed.
      if (process.env.LOG_UNMOCKED_RPC) {
        logUnmockedRpcRequests({ context, worker: testInfo.workerIndex, test: testInfo.title })
      }

      // The order book API is mocked, so updaters can poll much faster without adding real load.
      // See `getUpdaterInterval` in `libs/common-const/src/common.ts`.
      await context.addInitScript(() => {
        ;(window as unknown as { __COWSWAP_E2E__?: boolean }).__COWSWAP_E2E__ = true
      })

      const allowances = installAllowances(context)
      const balances = installBalances(context)
      const cowApi = await installCowProtocolApi(context)
      const orders = installOrdersMock(cowApi)
      const ethGetCode = installEthGetCode(context)
      installEthBlockNumber(context)
      installEthEstimateGas(context)
      installEthGetTransactionCount(context)
      installTokenNonce(context)
      installSocketVerifier(context)
      // Fires regardless of whether the UI ever shows an Approve step (confirmed by tracing real
      // traffic under `LOG_UNMOCKED_RPC=1` — it hit cross-chain tests that pre-seed a sufficient
      // allowance and never click Approve), so this is global rather than opt-in per test.
      mockApproveSimulation(context)
      const safeSdk = installSafeSdk(context)
      const bungee = installBungee(context)
      const nearIntents = installNearIntents(context)
      const launchDarkly = await installLaunchDarkly(context)
      const usdPrices = installUsdPrices(context)

      await use({
        allowances,
        balances,
        cowApi,
        orders,
        ethGetCode,
        safeSdk,
        bungee,
        nearIntents,
        launchDarkly,
        usdPrices,
      })

      ethGetCode.reset()
      bungee.reset()
      nearIntents.reset()
      await launchDarkly.reset()
      usdPrices.reset()
      await safeSdk.disable()
      allowances.reset()
      balances.reportUnknownOwners()
      balances.reset()
      orders.reset()
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
