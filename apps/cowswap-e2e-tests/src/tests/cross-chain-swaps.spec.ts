import { parseUnits, type Hex } from 'viem'

import { areAddressesEqual, BTC_CURRENCY_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'

import { test, expect } from '../fixtures'
import { reply } from '../mocks/cowProtocolApi'
import { generateOrderId } from '../mocks/orders'
import { mockEthFlowTransaction } from '../support/mockEthFlowTransaction'
import { mockFixedRateQuote } from '../support/mockFixedRateQuote'
import { seedTrader } from '../support/seedTrader'

import type { CowProtocolApiMock } from '../mocks/cowProtocolApi'
import type { LaunchDarklyMock } from '../mocks/launchDarkly'
import type { UsdPricesMock } from '../mocks/usdPrices'
import type { SwapPage } from '../pages/SwapPage'

/**
 * Scope notes (see cross-chain-swaps.specs.md for the full scenarios):
 *
 * - Bungee and Near Intents are mocked against their real APIs (`backend.bungee.exchange`,
 *   `1click.chaindefuser.com`) — see `mocks/bungee.ts` / `mocks/nearIntents.ts`. Near's quote is
 *   cryptographically signed by Near's attestor key over the exact quote+timestamp payload
 *   (`recoverDepositAddress` in `@cowprotocol/sdk-bridging`), so the Near fixture can only be
 *   replayed byte-for-byte, for the one real route it was captured for (Mainnet USDC → Base USDC)
 *   — it cannot be edited to match every chain pairing the spec names, and no valid fixture exists
 *   for a Solana/Bitcoin *destination* quote at all. Bungee's fixture isn't signature-bound, but
 *   is likewise a single captured route (also Mainnet USDC → Base USDC).
 * - Both bridge providers are gated behind LaunchDarkly flags in the real app; `mocks.launchDarkly`
 *   forces them on (Bungee alone would otherwise win real provider competition for any EVM↔EVM
 *   pair by being the only one enabled by default, and both are needed here per test).
 * - Given the above, CC-02/CC-03/CC-26/CC-27 use Mainnet USDC → Base USDC (the one route with a
 *   valid signed Near fixture) rather than the exact chains/tokens named in the spec, forcing a
 *   single provider on per test via `mocks.launchDarkly.setFlag`. CC-26/CC-27 cover the Bungee and
 *   Near Intents repeats but not the BNB/BTC decimal-precision repeats — no valid fixture exists
 *   for either.
 * - CC-15/CC-17 stop at the recipient-requirement UI states (chain selectability, button-state
 *   progression, confirmation checkbox) — the settlement-side assertions (tokens received, SOL/BTC
 *   decimal display) need a real resolved Solana/Bitcoin-destination quote, which no valid fixture
 *   exists for (see above).
 * - Bridge-order tracking after confirmation (Bridge Explorer navigation, CoW Explorer tracking,
 *   bridge tx hash) needs the separate deposit/status polling machinery
 *   (`PendingBridgeOrdersUpdater`) on top of everything above; out of scope here. These tests stop
 *   once the order is posted and confirmed, mirroring how the rest of this suite verifies order
 *   posting (`mockOrderPosting`) without simulating on-chain settlement of the bridge leg itself.
 * - CC-26's spec expects the swap and bridge stops' own "Min. to receive" figures to be equal —
 *   confirmed (via reading `useBridgeQuoteAmounts`/the bundled bridging SDK) to be two genuinely
 *   different calculations in the real app, not a mock artifact: the bridge stop's figure is the
 *   bridge SDK quote's own `afterSlippage.buyAmount`, carrying that provider's real routeFee/
 *   slippage rather than being rescaled to the swap leg the way "Expected to receive" is. This test
 *   checks both are present instead of asserting parity.
 */

const MAINNET = SupportedChainId.MAINNET
const BASE = SupportedChainId.BASE

const USDC_MAINNET = '0xA0b86991c6218b36c1d19D4A2e9Eb0cE3606eB48'
const USDC_BASE = '0x833589fCD6eDb6E08f4C7C32D4f71b54bdA02913'
const NATIVE_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const WETH_MAINNET = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const INITIAL_USDC_BALANCE = parseUnits('1000', 6)
const INITIAL_ETH_BALANCE = parseUnits('1', 18)

const PROVIDER_DISPLAY_NAME = { bungee: 'Bungee', 'near-intents': 'Near Intents' } as const

test.describe('Cross-chain swaps', () => {
  test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

  /**
   * Forces exactly one bridge provider on, stubs the on-chain check Bungee's quote needs, and pins
   * the swap leg's rate near 1:1. `BridgingSdk.getBestQuote()` first fetches a *regular* CoW quote
   * for the swap leg (sell token → intermediate token) and feeds its `buyAmount` in as the amount
   * the bridge provider quotes — `mocks.cowApi`'s default quote fixture scales that from a
   * WETH/18-decimal:testUSDC/18-decimal ratio (~1:547), which is nonsensical for this suite's real
   * USDC(6dec)→USDC(6dec) pair and was silently producing an amount so degenerate the bridge
   * provider quote failed outright.
   *
   * Also pins both USDC's `usdPrices` at $1 (their real-world peg, and already `usdPrices`'
   * unmocked default) — explicit rather than relying on that default, so this suite's price-impact-
   * driven UI (warning banners, "Confirm Price Impact" dialogs) stays predictable even if that
   * default ever changes. Consistent with the near-1:1 `mockFixedRateQuote` rate above.
   */
  async function configureProviders(
    mocks: { launchDarkly: LaunchDarklyMock; cowApi: CowProtocolApiMock; usdPrices: UsdPricesMock },
    rpcProxy: unknown,
    active: 'bungee' | 'near-intents',
  ): Promise<void> {
    await mocks.launchDarkly.setFlag('isBungeeBridgeProviderEnabled', active === 'bungee')
    await mocks.launchDarkly.setFlag('isNearIntentsBridgeProviderEnabled', active === 'near-intents')
    mockFixedRateQuote({ cowApi: mocks.cowApi, rate: { numerator: 999n, denominator: 1000n } })
    mocks.usdPrices.setPrice(USDC_MAINNET, 1)
    mocks.usdPrices.setPrice(USDC_BASE, 1)
  }

  /**
   * `/#/{chainId}/swap/{sell}/{buy}` alone can't express a cross-chain buy token — the router
   * resolves `buy` against the *path's* chain id unless a `targetChainId` query param says
   * otherwise (`useSetupTradeStateFromUrl.ts`, `parameterizeTradeSearch.ts`). Presetting
   * sell/buy/amount together in one navigation — rather than typing the amount then picking the
   * buy token through the UI, or vice versa — sidesteps a real race in the app's own quote
   * polling: whichever of the two happens second fires a fresh bridging quote fetch, but the
   * *first* one's now-stale in-flight fetch (still carrying the old amount, or no buy token yet)
   * can resolve after it and stick as the shown state — a bridge quote error is provider-and-pair
   * scoped, not amount-scoped, so nothing about the follow-up fetch retries or clears it.
   *
   * The app uses a hash router, so `page.goto()` to a new `#/...` route is a same-document
   * navigation — `bridgingSdk`'s available-provider set is seeded once at module load from
   * whatever `window.__COWSWAP_E2E_FEATURE_FLAGS__` holds at that moment (`useFeatureFlags.ts`'s
   * override memoizes on the real, permanently-unresolved LaunchDarkly flags, not on that window
   * global, so it never re-reads it after mount either). `mocks.launchDarkly.setFlag` only queues
   * a new `context.addInitScript`, which the browser only runs on the next real navigation — a
   * hash-only `page.goto()` doesn't trigger one. A caller that changes providers between two
   * `openCrossChainSwap` calls (`configureProviders` in between) MUST `page.reload()` first, once
   * already on a real app hash, for the switch to actually take effect — see AGENTS.md's
   * "HashRouter" note and [CS-285]'s second half for the working pattern.
   */
  async function openCrossChainSwap(
    wallet: { openApp(opts: { chainId: number; sell?: string }): Promise<void> },
    swapPage: SwapPage,
    opts: { chainId: number; sell: string; buy: string; targetChainId: number; sellAmount: string },
  ): Promise<void> {
    await wallet.openApp({ chainId: opts.chainId })
    await swapPage.unlockIfNeeded()
    const url = `/#/${opts.chainId}/swap/${opts.sell}/${opts.buy}?targetChainId=${opts.targetChainId}&sellAmount=${opts.sellAmount}`
    await swapPage.page.goto(url)
  }

  test('[CS-285] Cross-chain swap UI: accessible via Swap form @smoke', async ({
    swapPage,
    wallet,
    mocks,
    rpcProxy,
  }) => {
    seedTrader(mocks, wallet, MAINNET, {
      balances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
      allowances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
    })

    await configureProviders(mocks, rpcProxy, 'bungee')
    await openCrossChainSwap(wallet, swapPage, {
      chainId: MAINNET,
      sell: USDC_MAINNET,
      buy: USDC_BASE,
      targetChainId: BASE,
      sellAmount: '100',
    })
    await swapPage.waitForQuote()
    await swapPage.routePanel.expand()
    await expect(swapPage.routePanel.swapStopTitle).toBeVisible()
    await expect(swapPage.routePanel.bridgeStopTitle('Bungee')).toBeVisible()

    await configureProviders(mocks, rpcProxy, 'near-intents')
    await swapPage.page.reload()
    await openCrossChainSwap(wallet, swapPage, {
      chainId: MAINNET,
      sell: USDC_MAINNET,
      buy: USDC_BASE,
      targetChainId: BASE,
      sellAmount: '100',
    })
    await swapPage.waitForQuote()
    await swapPage.routePanel.expand()
    await expect(swapPage.routePanel.swapStopTitle).toBeVisible()
    await expect(swapPage.routePanel.bridgeStopTitle('Near Intents')).toBeVisible()
  })

  test('[CS-286] Cross-chain swap: Near provider', async ({ swapPage, wallet, confirmModal, mocks, rpcProxy }) => {
    seedTrader(mocks, wallet, MAINNET, {
      balances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
      allowances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
    })
    await configureProviders(mocks, rpcProxy, 'near-intents')

    await openCrossChainSwap(wallet, swapPage, {
      chainId: MAINNET,
      sell: USDC_MAINNET,
      buy: USDC_BASE,
      targetChainId: BASE,
      sellAmount: '100',
    })
    await swapPage.waitForQuote()
    await swapPage.routePanel.expand()

    await expect(swapPage.routePanel.swapStopTitle).toBeVisible()
    await expect(swapPage.routePanel.bridgeStopTitle('Near Intents')).toBeVisible()

    // Swap leg line items. `mockFixedRateQuote` zeroes the fee, so this always renders as
    // `FreeFeeRow`'s plain "Fee" / "FREE" rather than `ProtocolFeeRow`'s "Protocol fee (X%)" —
    // and with no network fee either, `NetworkCostsRow` doesn't render at all in that state.
    await expect(swapPage.routePanel.swapFee()).toBeVisible()
    await expect(swapPage.routePanel.swapExpectedToReceive()).toHaveAttribute('title', /.+/)
    await expect(swapPage.routePanel.swapMinToReceive()).toHaveAttribute('title', /.+/)
    await expect(swapPage.routePanel.swapQuoteId()).toBeVisible()

    // Intermediate recipient differs from the wallet owner. `AddressLink` shows a truncated
    // "0x844C...1Cb5" string but links to the explorer with the full address in the URL.
    const swapRecipientHref = await swapPage.routePanel.swapRecipient().locator('a').getAttribute('href')
    const swapRecipientAddress = swapRecipientHref?.match(/0x[a-fA-F0-9]{40}/)?.[0]
    expect(swapRecipientAddress).toBeTruthy()
    expect(areAddressesEqual(swapRecipientAddress, wallet.address)).toBe(false)

    // Bridge leg line items.
    await expect(swapPage.routePanel.bridgeEstTime()).toBeVisible()
    await expect(swapPage.routePanel.bridgeCosts()).toBeVisible()
    await expect(swapPage.routePanel.bridgeExpectedToReceive()).toHaveAttribute('title', /.+/)
    await expect(swapPage.routePanel.bridgeMinToDeposit()).toHaveAttribute('title', /.+/)
    await expect(swapPage.routePanel.bridgeMinToReceive()).toHaveAttribute('title', /.+/)

    const orderId = generateOrderId()
    // Confirming a cross-chain swap needs two separate enable-waits + clicks
    // (clickPrimaryAction, then confirmModal.confirm()) before the order actually posts — under a
    // loaded CI runner that sequence alone can eat past the default 10s budget with no time left
    // for the network round-trip, observed in CI as a false "no postOrder request observed"
    // failure even though the trigger was still mid-flight. Bumped to this suite's usual slow-step
    // allowance (15s) rather than the specific number that happened to just barely cover one run.
    await mocks.orders.expectOrderToBePosted({
      orderId,
      owner: wallet.address,
      timeoutMs: 15_000,
      trigger: async () => {
        await swapPage.clickPrimaryAction()
        await confirmModal.confirm()
      },
    })
    await swapPage.orderProgressBarModal.waitFor({ state: 'visible' })

    mocks.orders.fulfillOrder(orderId, mocks.balances, MAINNET, INITIAL_USDC_BALANCE, 0n)
    // The swap leg settles and the progress modal moves on to bridging — full bridge-order
    // tracking (`PendingBridgeOrdersUpdater`'s deposit/status polling) is out of scope here (see
    // the module doc comment), so this is as far as the mocked flow goes.
    await expect(swapPage.orderProgressBarModal).toContainText('Bridging to destination', { timeout: 15_000 })
  })

  test('[CS-287] Cross-chain swap: Bungee provider @smoke', async ({
    swapPage,
    wallet,
    confirmModal,
    mocks,
    rpcProxy,
  }) => {
    seedTrader(mocks, wallet, MAINNET, {
      balances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
      allowances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
    })
    await configureProviders(mocks, rpcProxy, 'bungee')

    await openCrossChainSwap(wallet, swapPage, {
      chainId: MAINNET,
      sell: USDC_MAINNET,
      buy: USDC_BASE,
      targetChainId: BASE,
      sellAmount: '100',
    })
    await swapPage.waitForQuote()
    await swapPage.routePanel.expand()

    await expect(swapPage.routePanel.swapStopTitle).toBeVisible()
    await expect(swapPage.routePanel.bridgeStopTitle('Bungee')).toBeVisible()

    // Swap leg line items. `mockFixedRateQuote` zeroes the fee, so this always renders as
    // `FreeFeeRow`'s plain "Fee" / "FREE" rather than `ProtocolFeeRow`'s "Protocol fee (X%)" —
    // and with no network fee either, `NetworkCostsRow` doesn't render at all in that state.
    await expect(swapPage.routePanel.swapFee()).toBeVisible()
    await expect(swapPage.routePanel.swapExpectedToReceive()).toHaveAttribute('title', /.+/)
    await expect(swapPage.routePanel.swapMinToReceive()).toHaveAttribute('title', /.+/)
    await expect(swapPage.routePanel.swapQuoteId()).toBeVisible()

    // Bungee settles via a CoW-Shed hook on the user's Account Proxy — banner shows that address.
    await expect(swapPage.routePanel.accountProxyBanner).toBeVisible()
    await expect(swapPage.routePanel.accountProxyBanner.locator('a')).toHaveAttribute('href', /.+/)

    // Bridge leg line items.
    await expect(swapPage.routePanel.bridgeEstTime()).toBeVisible()
    await expect(swapPage.routePanel.bridgeCosts()).toBeVisible()
    await expect(swapPage.routePanel.bridgeExpectedToReceive()).toHaveAttribute('title', /.+/)
    await expect(swapPage.routePanel.bridgeMinToDeposit()).toHaveAttribute('title', /.+/)
    await expect(swapPage.routePanel.bridgeMinToReceive()).toHaveAttribute('title', /.+/)

    const orderId = generateOrderId()
    // Confirming a cross-chain swap needs two separate enable-waits + clicks
    // (clickPrimaryAction, then confirmModal.confirm()) before the order actually posts — under a
    // loaded CI runner that sequence alone can eat past the default 10s budget with no time left
    // for the network round-trip, observed in CI as a false "no postOrder request observed"
    // failure even though the trigger was still mid-flight. Bumped to this suite's usual slow-step
    // allowance (15s) rather than the specific number that happened to just barely cover one run.
    await mocks.orders.expectOrderToBePosted({
      orderId,
      owner: wallet.address,
      timeoutMs: 15_000,
      trigger: async () => {
        await swapPage.clickPrimaryAction()
        await confirmModal.confirm()
      },
    })
    await swapPage.orderProgressBarModal.waitFor({ state: 'visible' })

    mocks.orders.fulfillOrder(orderId, mocks.balances, MAINNET, INITIAL_USDC_BALANCE, 0n)
    // The swap leg settles and the progress modal moves on to bridging — full bridge-order
    // tracking (`PendingBridgeOrdersUpdater`'s deposit/status polling) is out of scope here (see
    // the module doc comment), so this is as far as the mocked flow goes.
    await expect(swapPage.orderProgressBarModal).toContainText('Bridging to destination', { timeout: 15_000 })
  })

  test('[CS-297] Cross-chain: ETH-flow source — native ETH sent cross-chain @smoke', async ({
    swapPage,
    wallet,
    confirmModal,
    mocks,
    context,
    rpcProxy,
  }) => {
    seedTrader(mocks, wallet, MAINNET, { balances: { [NATIVE_ETH]: INITIAL_ETH_BALANCE } })
    await configureProviders(mocks, rpcProxy, 'bungee')

    // `configureProviders`'s `mockFixedRateQuote({ rate: { numerator: 999n, denominator: 1000n } })`
    // computes `buyAmount = sellAmount * 999n / 1000n` — correct for every other test here, where
    // sell and (intermediate) buy token are both 6-decimal USDC, but wrong for this one: selling
    // 18-decimal native ETH into a 6-decimal USDC intermediate needs the ratio scaled down by
    // 10^12, or the naive multiply leaves `buyAmount` twelve orders of magnitude too large (surfaced
    // as Bungee's mocked `inputAmount` request param, then as an absurd "for at least 99.339B USDC"
    // in the confirm modal). Re-overriding the same `quote` endpoint here fixes it without touching
    // `mockFixedRateQuote`'s shared, decimals-agnostic default behaviour.
    mocks.cowApi.set('quote', (req) => {
      const defaults = req.defaults as { quote: Record<string, unknown> }
      const sellAmount = BigInt(defaults.quote.sellAmount as string)
      const buyAmount = (sellAmount * 999n) / (1000n * 10n ** 12n)
      return {
        ...defaults,
        protocolFeeBps: '0',
        quote: { ...defaults.quote, buyAmount: buyAmount.toString(), feeAmount: '0' },
      }
    })

    // Prices ETH at $1 too (its `useUsdPrice` lookup goes through `getWrappedToken`, i.e. WETH's
    // address, not the pseudo `NATIVE_ETH` one) — matching the near-1:1 rate the quote override
    // above encodes (999/1000), same reasoning as `configureProviders`'s USDC pricing.
    mocks.usdPrices.setPrice(WETH_MAINNET, 1)

    // Selling native ETH doesn't POST an off-chain EIP-712-signed order like every other trade in
    // this suite — it sends an on-chain `createOrder()` tx to a dedicated EthFlow contract instead
    // (with the sell amount as `tx.value`), so this needs `mockEthFlowTransaction` rather than
    // `tradePage.mockOrderPosting`. Without it, confirming sends a real, un-stubbed
    // `eth_sendTransaction` to the real RPC, which is what was surfacing as "Missing or invalid
    // parameters" — see `mockEthFlowTransaction` and [MO-11] for the non-bridging version of this
    // same distinction.
    const ethFlow = await mockEthFlowTransaction({
      context,
      wallet,
      initialEthBalance: INITIAL_ETH_BALANCE,
    })

    // An eth-flow `createOrder()` tx only carries the app-data *hash* on-chain (a `bytes32`, no
    // room for the full JSON document) — the app uploads the full document separately via
    // `PUT /api/v1/app_data/{hash}` beforehand, same as every other order type here, so it's still
    // capturable that way (see [MO-30] for the same capture pattern used to assert on it instead).
    // Capturing and echoing it back matters for more than fidelity: `useSwapAndBridgeContext`
    // resolves the bridge provider from `order.apiAdditionalInfo.fullAppData`
    // (`bridgingSdk.getProviderFromAppData`) to decide whether this is a bridging order at all —
    // without it, `bridgingStatus` never resolves and the progress modal sticks on "Executing"
    // forever, regardless of what `order`/`orderStatus` themselves report.
    let uploadedAppData: string | undefined
    mocks.cowApi.set('putAppData', (req) => {
      uploadedAppData = (req.body as { fullAppData: string }).fullAppData
      return req.params.hash
    })

    // Mirrors [MO-11]'s inlined `order`-endpoint override: an ETH-flow order's uid is computed
    // client-side before anything is sent on-chain, so there's no `postOrder` call to hook the way
    // `mockOrderPosting` does for every other order type here.
    let orderIndexed = false
    mocks.cowApi.set('order', (req) => {
      if (!orderIndexed) return reply(404, { errorType: 'NotFound' })

      const orderParams = ethFlow.getOrderParams()
      const defaults = req.defaults as Record<string, unknown>
      const filled = ethFlow.isFilled()
      const executedSellAmount = filled ? orderParams?.sellAmount.toString() : '0'
      return {
        ...defaults,
        kind: 'sell',
        buyToken: orderParams?.buyToken,
        sellAmount: orderParams?.sellAmount.toString(),
        buyAmount: orderParams?.buyAmount.toString(),
        status: filled ? 'fulfilled' : 'open',
        executedBuyAmount: filled ? orderParams?.buyAmount.toString() : '0',
        executedSellAmount,
        executedSellAmountBeforeFees: executedSellAmount,
        fullAppData: uploadedAppData,
      }
    })

    await openCrossChainSwap(wallet, swapPage, {
      chainId: MAINNET,
      sell: NATIVE_ETH,
      buy: USDC_BASE,
      targetChainId: BASE,
      sellAmount: '0.1',
    })
    await swapPage.waitForQuote()

    // Native ETH accepted directly for a cross-chain sell — no separate wrap step is offered.
    await expect(swapPage.approveButton).toBeHidden()
    await expect(swapPage.swapButton).toContainText(/swap.*bridge/i)

    await swapPage.clickSwap()
    await confirmModal.confirm()

    // Confirming signs/sends the on-chain creation tx directly (`eth_sendTransaction`, stubbed by
    // `mockEthFlowTransaction`) — there's no separate off-chain EIP-712 signature for this flow.
    // Same CI-load headroom as the `expectOrderToBePosted` calls above: the preceding
    // `clickSwap()`/`confirmModal.confirm()` pair alone was observed taking close to the default
    // 10s budget on a loaded runner, leaving the poll no room to ever see a sent value.
    await expect.poll(() => ethFlow.getSentValue(), { timeout: 15_000 }).toBe(parseUnits('0.1', 18))
    ethFlow.confirmMined()
    orderIndexed = true

    await swapPage.orderProgressBarModal.waitFor({ state: 'visible' })

    const orderParams = ethFlow.getOrderParams()
    if (!orderParams) throw new Error('mockEthFlowTransaction: fulfill attempted before an order was sent')
    seedTrader(mocks, wallet, MAINNET, { balances: { [USDC_BASE]: orderParams.buyAmount } })
    ethFlow.confirmFilled()

    // Mirrors `mockOrderPosting.fulfill()`'s other half: the order-progress modal's competition
    // stages (shared with the regular, non-eth-flow bridging tests) advance past "Executing" only
    // once `orderStatus` itself reports `traded` — setting `order`'s own `status` above isn't
    // enough on its own.
    mocks.cowApi.set('orderStatus', () => ({
      type: 'traded',
      value: [
        {
          solver: '0x99b4136666ca1d13020830350ca8d01a0e5e466b',
          executedAmounts: { sell: orderParams.sellAmount.toString(), buy: orderParams.buyAmount.toString() },
        },
      ],
    }))

    // The swap leg settles and the progress modal moves on to bridging — full bridge-order
    // tracking (`PendingBridgeOrdersUpdater`'s deposit/status polling) is out of scope here (see
    // the module doc comment), so this is as far as the mocked flow goes.
    await expect(swapPage.orderProgressBarModal).toContainText('Bridging to destination', { timeout: 15_000 })
  })

  test('[CS-299] Cross-chain: swap to Solana — SOL or SPL token as destination @smoke', async ({
    swapPage,
    wallet,
    mocks,
    context,
    rpcProxy,
  }) => {
    seedTrader(mocks, wallet, MAINNET, {
      balances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
      allowances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
    })
    await configureProviders(mocks, rpcProxy, 'near-intents')
    await mocks.launchDarkly.setFlag('isSolBridgeEnabled', true)
    // Distinct from the LaunchDarkly-style flag above: `IS_SOLANA_ENABLED` is a plain localStorage
    // switch (`libs/common-const/src/featureFlags.ts`) gating whether Solana even has a
    // `CHAIN_INFO` entry to begin with — without it, `useSupportedTargetChains` has the flag on but
    // nothing to look up, and Solana still can't appear as a destination chain.
    await context.addInitScript(() => localStorage.setItem('IS_SOLANA_ENABLED', '1'))

    await wallet.openApp({ chainId: MAINNET, sell: USDC_MAINNET })
    await swapPage.unlockIfNeeded()
    await swapPage.enterSellAmount('100')

    await swapPage.tokens.openOutput()
    await expect(swapPage.page.getByText('Solana', { exact: true })).toBeVisible()
    await swapPage.tokens.selectChain('Solana')
    await swapPage.tokens.searchAndPick('SOL')

    // No default recipient — the button is disabled and names Solana specifically. No `id` in
    // this validation state (`RecipientNotSet` in `tradeButtonsMap.tsx` renders a plain
    // `TradeFormBlankButton` with no `id` prop — only the "no validation errors" state gets
    // `#do-trade-button`), so matched by role/text instead of `swapButton`.
    const recipientRequiredButton = swapPage.page.getByRole('button', { name: /recipient is required for solana/i })
    await expect(recipientRequiredButton).toBeVisible()
    await expect(recipientRequiredButton).toBeDisabled()
    await expect(swapPage.page.getByText('Send to Solana wallet', { exact: true })).toBeVisible()
    await expect(swapPage.recipientPasteButton).toBeVisible()

    const SOLANA_ADDRESS = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'
    await swapPage.recipientInput.fill(SOLANA_ADDRESS)

    // Valid address, not yet confirmed. Same no-`id` situation as above (`RecipientNotConfirmed`).
    const confirmRecipientButton = swapPage.page.getByRole('button', { name: /confirm recipient to swap/i })
    await expect(confirmRecipientButton).toBeVisible()
    await expect(confirmRecipientButton).toBeDisabled()

    // Under load, a still-settling recipient-validation debounce can reset `confirmed` back to
    // false right after this click lands (the checkbox is a controlled input driven by that
    // validation state) — Playwright's own `.check()` sees the click "not change its state" when
    // that happens. Retrying the click until it actually sticks rides out the race instead of
    // asserting on a single attempt.
    await expect
      .poll(async () => {
        await swapPage.recipientConfirmationCheckbox.check()
        return swapPage.recipientConfirmationCheckbox.isChecked()
      })
      .toBe(true)

    // Once validation passes, the primary CTA becomes `TradeApproveButton` (an ERC-20 allowance
    // decision applies to every cross-chain sell here) rather than the plain `swapButton`.
    await expect(swapPage.primaryActionButton).toContainText(/swap and bridge/i)
    await expect(swapPage.primaryActionButton).toBeEnabled()
  })

  test('[CS-301] Cross-chain: swap to Bitcoin — BTC as destination @smoke', async ({
    swapPage,
    wallet,
    mocks,
    rpcProxy,
  }) => {
    seedTrader(mocks, wallet, MAINNET, {
      balances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
      allowances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
    })
    await configureProviders(mocks, rpcProxy, 'near-intents')
    await mocks.launchDarkly.setFlag('isBtcBridgeEnabled', true)

    mocks.usdPrices.setPrice(BTC_CURRENCY_ADDRESS, 64_016)

    await wallet.openApp({ chainId: MAINNET, sell: USDC_MAINNET })
    await swapPage.unlockIfNeeded()
    await swapPage.enterSellAmount('100')

    await swapPage.tokens.openOutput()
    await expect(swapPage.page.getByText('Bitcoin', { exact: true })).toBeVisible()
    await swapPage.tokens.selectChain('Bitcoin')
    await swapPage.tokens.searchAndPick('BTC(OMNI)')

    // No `id` in this validation state — see the matching comment in [CC-15].
    const recipientRequiredButton = swapPage.page.getByRole('button', { name: /recipient is required for bitcoin/i })
    await expect(recipientRequiredButton).toBeVisible()
    await expect(recipientRequiredButton).toBeDisabled()

    const BITCOIN_ADDRESS = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
    await swapPage.recipientInput.fill(BITCOIN_ADDRESS)

    const confirmRecipientButton = swapPage.page.getByRole('button', { name: /confirm recipient to swap/i })
    await expect(confirmRecipientButton).toBeVisible()
    await expect(confirmRecipientButton).toBeDisabled()
    await expect(
      swapPage.page.getByText(/Recipient is on Bitcoin network\. Confirm this is the correct address/i),
    ).toBeVisible()

    // Under load, a still-settling recipient-validation debounce can reset `confirmed` back to
    // false right after this click lands (the checkbox is a controlled input driven by that
    // validation state) — Playwright's own `.check()` sees the click "not change its state" when
    // that happens. Retrying the click until it actually sticks rides out the race instead of
    // asserting on a single attempt.
    await expect
      .poll(async () => {
        await swapPage.recipientConfirmationCheckbox.check()
        return swapPage.recipientConfirmationCheckbox.isChecked()
      })
      .toBe(true)

    // Once validation passes, the primary CTA becomes `TradeApproveButton` (an ERC-20 allowance
    // decision applies to every cross-chain sell here) rather than the plain `swapButton`.
    await expect(swapPage.primaryActionButton).toContainText(/swap and bridge/i)
    await expect(swapPage.primaryActionButton).toBeEnabled()
  })

  test('[CS-310] Cross-chain: calculation parity — form Receive equals bridge Expected to receive @smoke', async ({
    swapPage,
    wallet,
    mocks,
    rpcProxy,
  }) => {
    seedTrader(mocks, wallet, MAINNET, {
      balances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
      allowances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
    })

    for (const [index, provider] of (['bungee', 'near-intents'] as const).entries()) {
      await configureProviders(mocks, rpcProxy, provider)
      // Switching providers on an already-loaded page needs an actual reload for the new
      // LaunchDarkly flags to take effect — see `openCrossChainSwap`'s doc comment and AGENTS.md.
      // Not needed before the very first iteration: nothing has navigated yet at that point.
      if (index > 0) await swapPage.page.reload()
      await openCrossChainSwap(wallet, swapPage, {
        chainId: MAINNET,
        sell: USDC_MAINNET,
        buy: USDC_BASE,
        targetChainId: BASE,
        sellAmount: '100',
      })
      await swapPage.waitForQuote()
      await swapPage.routePanel.expand()

      // Confirms the intended provider actually switched (not just that the reload happened) —
      // without this, a missed reload would silently re-test Bungee twice instead of failing.
      await expect(swapPage.routePanel.bridgeStopTitle(PROVIDER_DISPLAY_NAME[provider])).toBeVisible()

      // Per spec: form `Receive (incl. fees)` equals the *bridge* stop's `Expected to receive`
      // (the final, post-bridge amount) — not the swap stop's own row, which shows the swap
      // leg's unscaled output (`QuoteObserverUpdater` overwrites the form's own
      // `outputCurrencyAmount` with `useEstimatedBridgeBuyAmount`'s bridge-rescaled figure, but the
      // swap stop's row in the panel reads the swap quote directly, un-rescaled).
      const formReceive = await swapPage.receiveAmountValue.getAttribute('title')
      await expect(swapPage.routePanel.bridgeExpectedToReceive()).toHaveAttribute('title', formReceive ?? '')
      await expect(swapPage.routePanel.swapExpectedToReceive()).toHaveAttribute('title', /.+/)

      // Unlike "Expected to receive" (rescaled through the same ratio for both stops, hence the
      // equality above), "Min. to receive" is genuinely two different calculations in the real
      // app, not a mock artifact: the swap stop's own figure comes from the swap quote's
      // `amountsToSign` tier, while the bridge stop's is read straight off the bridge SDK quote's
      // `amountsAndCosts.afterSlippage.buyAmount` — for Bungee that's `route.output.amount` with
      // its own real routeFee baked in (a genuine, small, provider-specific bridging cost, not
      // rescaled to match the swap leg), and for Near Intents it's an absolute number lifted
      // verbatim from the signed fixture (`near-quote.json`), unrelated to this test's actual sell
      // amount since that fixture can't be rescaled (see the module doc comment). Asserting only
      // presence here, not parity with the swap leg's own Min. to receive.
      await expect(swapPage.routePanel.swapMinToReceive()).toHaveAttribute('title', /.+/)
      await expect(swapPage.routePanel.bridgeMinToReceive()).toHaveAttribute('title', /.+/)
    }
  })

  test('[CS-311] Cross-chain: calculation parity — bridge Min. to deposit equals swap Min. to receive @smoke', async ({
    swapPage,
    wallet,
    mocks,
    rpcProxy,
  }) => {
    seedTrader(mocks, wallet, MAINNET, {
      balances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
      allowances: { [USDC_MAINNET]: INITIAL_USDC_BALANCE },
    })

    for (const [index, provider] of (['bungee', 'near-intents'] as const).entries()) {
      await configureProviders(mocks, rpcProxy, provider)
      // Switching providers on an already-loaded page needs an actual reload for the new
      // LaunchDarkly flags to take effect — see `openCrossChainSwap`'s doc comment and AGENTS.md.
      // Not needed before the very first iteration: nothing has navigated yet at that point.
      if (index > 0) await swapPage.page.reload()
      await openCrossChainSwap(wallet, swapPage, {
        chainId: MAINNET,
        sell: USDC_MAINNET,
        buy: USDC_BASE,
        targetChainId: BASE,
        sellAmount: '100',
      })
      await swapPage.waitForQuote()
      await swapPage.routePanel.expand()

      // Confirms the intended provider actually switched (not just that the reload happened) —
      // without this, a missed reload would silently re-test Bungee twice instead of failing.
      await expect(swapPage.routePanel.bridgeStopTitle(PROVIDER_DISPLAY_NAME[provider])).toBeVisible()

      const swapMinToReceive = await swapPage.routePanel.swapMinToReceive().getAttribute('title')
      await expect(swapPage.routePanel.bridgeMinToDeposit()).toHaveAttribute('title', swapMinToReceive ?? '')
    }
  })
})
