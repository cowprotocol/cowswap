import { encodeFunctionData, formatUnits, parseUnits, type Hex } from 'viem'

import { areAddressesEqual, bpsToPercentage } from '@cowprotocol/cow-sdk'

import { test, expect } from '../fixtures'
import { reply } from '../mocks/cowProtocolApi'
import { CHAIN_IDS } from '../support/constants'
import { expectActivityStatus } from '../support/expectActivityStatus'
import { mockApproveTransaction } from '../support/mockApproveTransaction'
import { mockBridgeSupportedTokens } from '../support/mockBridgeSupportedTokens'
import { mockCancellableOrder } from '../support/mockCancellableOrder'
import { mockEthFlowOrderIndexing } from '../support/mockEthFlowOrderIndexing'
import { mockEthFlowTransaction } from '../support/mockEthFlowTransaction'
import { mockFixedRateQuote } from '../support/mockFixedRateQuote'
import { mockHookLogo } from '../support/mockHookLogo'
import { mockHooksSimulation } from '../support/mockHooksSimulation'
import { mockTokenLogos } from '../support/mockTokenLogos'
import { mockUnwrapTransaction } from '../support/mockUnwrapTransaction'
import { mockWrapTransaction } from '../support/mockWrapTransaction'
import { readTitledAmount } from '../support/readTitledAmount'
import { seedTrader } from '../support/seedTrader'
import { selectTokens } from '../support/selectTokens'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
const DAI = '0xB4F1737Af37711e9A5890D9510c9bB60e170CB0D'
const USDT = '0x58eb19ef91e8a6327fed391b51ae1887b833cc91'
// Real Gnosis-chain WXDAI — used only as a "buy token from another chain" stand-in for [CS-136],
// never actually traded, so no real Gnosis RPC call is needed to back it (see that test's own
// `mocks.tokenLists.setListForChain` call).
const WXDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
const CHAIN_ID = CHAIN_IDS.SEPOLIA
const GNOSIS_CHAIN_ID = CHAIN_IDS.GNOSIS

test.describe('Market Orders', () => {
  test.describe('Connected EOA wallet', () => {
    test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

    // A default for every test in this file, per `AGENTS.md`'s "Using mocks" note — a test that
    // forgets to seed its own balance (e.g. [CS-62], which never asserts on a balance figure at
    // all) would otherwise leave `mocks.balances` unconfigured for its owner. Tests that care about
    // a specific starting balance already override this via their own `seedTrader`/
    // `setupTestConditions` call, which simply replaces these two entries.
    test.beforeEach(({ mocks, wallet }) => {
      mocks.balances.set(wallet.address, CHAIN_ID, { [USDC]: parseUnits('1500', 18), [WETH]: parseUnits('10', 18) })
    })

    test('[CS-59] Sell order: ERC-20 → ERC-20 @smoke', async ({
      swapPage,
      tradePage,
      wallet,
      confirmModal,
      accountModal,
      mocks,
    }) => {
      // On this Sepolia deployment both test tokens report 18 decimals on-chain (verified via
      // `decimals()`), not USDC's real-world 6 — `support/tokens.ts` already accounts for this.
      // Raw atoms are computed here via `parseUnits` with an explicit 18 as a local literal, since
      // this test doesn't go through `setupTestConditions`/`resolveToken` at all.
      const INITIAL_USDC_BALANCE = parseUnits('1500', 18)
      const BUY_RATE_NUM = 804n
      const BUY_RATE_DEN = 1_000_000n // quote buyAmount ~= 0.804 WETH per 1000 USDC sold, pre-slippage

      // Zeroing the fee keeps the posted sellAmount matching the typed amount exactly, so the
      // sell-side balance assertion below is a round number. The buy side still goes through the
      // app's own slippage, so it's asserted dynamically via `posting.getPostedBuyAmount()` rather
      // than a hardcoded figure.
      mockFixedRateQuote({ cowApi: mocks.cowApi, rate: { numerator: BUY_RATE_NUM, denominator: BUY_RATE_DEN } })

      const posting = tradePage.mockOrderPosting(mocks.cowApi, wallet.address)

      // `usdPrices` defaults every token to $1 — under that assumption this trade's quoted rate
      // looks like a ~99.9% loss and trips the "Confirm Price Impact" dialog. Pricing WETH to match
      // the quote rate keeps the trade looking fair so that extra screen doesn't appear.
      mocks.usdPrices.setPrice(WETH, Number(BUY_RATE_DEN) / Number(BUY_RATE_NUM))

      seedTrader(mocks, wallet, CHAIN_ID, {
        balances: { [USDC]: INITIAL_USDC_BALANCE, [WETH]: 0n },
        allowances: { [USDC]: INITIAL_USDC_BALANCE },
      })

      await swapPage.goto({ chainId: CHAIN_ID })

      // Typed before selecting tokens, not after: selecting a token with no amount set yet
      // auto-fills 1 whole unit of it (`useSetupTradeAmountsFromUrl`'s
      // `!isAtLeastOneAmountIsSetRef.current` default), which races the real typed amount's own
      // debounced quote fetch and can win under load — same race as [CS-68]'s ETH-flow note, just
      // hit here via `selectTokens` instead of a manual token switch. Typing first against
      // whatever's already selected trips the "amount already set" guard before `selectTokens` runs,
      // and the typed amount carries over once USDC/WETH are picked.
      await swapPage.enterSellAmount('1000')
      await selectTokens(swapPage, 'USDC', 'WETH')

      await expect(swapPage.sellBalance).toHaveAttribute('title', '1500 USDC')
      await expect(swapPage.buyBalance).toHaveAttribute('title', '0 WETH')
      await expect(swapPage.inputAmount).toHaveValue('1000')

      await swapPage.waitForQuote()

      await swapPage.clickSwap()
      await confirmModal.confirm()

      // Step 1 (INITIAL, backend OPEN/SCHEDULED) — order just posted, competition not started yet.
      await expect(swapPage.orderProgressBarModal).toContainText('Batching orders')

      // Step 2 (SOLVING, backend ACTIVE — the default `orderStatus` fixture) — competition started,
      // solvers searching for the best price. All 4 steps' titles are always rendered together
      // regardless of which one is active (`StepsWrapper` renders the full `STEPS` list, see
      // `constants.ts`), so "Batching orders" alone wouldn't distinguish this step from step 1 —
      // `SolvingStep`'s own body text is the part unique to it being the *active* step.
      // `useOrderProgressBarProps.ts`'s `MINIMUM_STEP_DISPLAY_TIME` holds step 1 on screen for at
      // least 5s before advancing here too, racing the default 5s assertion timeout — same reason
      // step 3 below needs more room than the default.
      await expect(swapPage.orderProgressBarModal).toContainText('best price wins', { timeout: 15_000 })

      // Step 3 (EXECUTING) — solver picked a winner, submitting the trade on-chain.
      // `ExecutingStep` overrides that step's own title to "Best price found!" while active.
      // `useOrderProgressBarProps.ts`'s `MINIMUM_STEP_DISPLAY_TIME` holds each step on screen for at
      // least 5s before advancing to the next one, so this needs more room than the default 5s.
      posting.markExecuting()
      await expect(swapPage.orderProgressBarModal).toContainText('Best price found!', { timeout: 15_000 })

      await expectActivityStatus(accountModal, 'Open')

      // Settle the order now that it's posted and confirmed.
      posting.fulfill(mocks.balances, CHAIN_ID, INITIAL_USDC_BALANCE, 0n)

      // Step 4 (FINISHED, backend TRADED) — trade settled.
      await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!', { timeout: 15_000 })

      // `FinishedStep`'s "You sold"/"Received" rows render the order's actual executed amounts
      // (`order.apiAdditionalInfo.executedSellAmount`/`executedBuyAmount`), not the originally
      // quoted ones — cross-check them against what `fulfill()` actually settled the order at.
      const soldAmountRow = swapPage.orderProgressBarModal.locator('span', { hasText: 'You sold' }).first()
      const receivedAmountRow = swapPage.orderProgressBarModal.locator('span', { hasText: 'Received' }).first()
      expect(await readTitledAmount(soldAmountRow)).toBe(BigInt(posting.getPostedSellAmount()))
      expect(await readTitledAmount(receivedAmountRow)).toBe(BigInt(posting.getPostedBuyAmount()))

      await swapPage.page.keyboard.press('Escape')

      await expect(swapPage.sellBalance).toHaveAttribute('title', '500 USDC', { timeout: 15_000 })
      await expect(swapPage.buyBalance).toHaveAttribute(
        'title',
        `${formatUnits(BigInt(posting.getPostedBuyAmount()), 18)} WETH`,
        { timeout: 15_000 },
      )

      await expectActivityStatus(accountModal, 'Filled')
    })

    test('[CS-60] Buy order: specify exact buy amount (ERC-20) @smoke', async ({
      swapPage,
      tradePage,
      wallet,
      confirmModal,
      accountModal,
      mocks,
    }) => {
      // Same 18-decimals quirk as [CS-59].
      const INITIAL_USDC_BALANCE = parseUnits('1500', 18)
      const RATE = 1000n // 1 WETH = 1000 USDC

      // Mirrors [CS-59]'s technique, but derived from the quote's `buyAmount` instead of its
      // `sellAmount` — for a buy order the typed amount fixes buyAmount exactly, and it's sellAmount
      // that's quoted/slippage-adjusted. Fee/protocolFeeBps stay zeroed so the posted buyAmount
      // matches the typed amount exactly, keeping the buy-side balance assertion a round number.
      mockFixedRateQuote({ cowApi: mocks.cowApi, direction: 'buy', rate: { numerator: RATE, denominator: 1n } })

      const posting = tradePage.mockOrderPosting(mocks.cowApi, wallet.address)

      // `usdPrices` defaults every token to $1 — pricing WETH to match the quote rate keeps the
      // trade looking fair so the "Confirm Price Impact" dialog doesn't appear, same as [CS-59].
      mocks.usdPrices.setPrice(WETH, Number(RATE))

      seedTrader(mocks, wallet, CHAIN_ID, {
        balances: { [USDC]: INITIAL_USDC_BALANCE, [WETH]: 0n },
        allowances: { [USDC]: INITIAL_USDC_BALANCE },
      })

      await swapPage.goto({ chainId: CHAIN_ID })
      await selectTokens(swapPage, 'USDC', 'WETH')

      await expect(swapPage.sellBalance).toHaveAttribute('title', '1500 USDC')
      await expect(swapPage.buyBalance).toHaveAttribute('title', '0 WETH')

      await swapPage.enterBuyAmount('1')
      await swapPage.waitForQuote()

      await swapPage.clickSwap()
      await confirmModal.confirm()

      await expect(swapPage.orderProgressBarModal).toContainText('Batching orders')
      await swapPage.page.keyboard.press('Escape')
      await expect(swapPage.orderProgressBarModal).toBeHidden()

      await expectActivityStatus(accountModal, 'Open')

      // Settle the order now that it's posted and confirmed — mirrors [CS-59].
      posting.fulfill(mocks.balances, CHAIN_ID, INITIAL_USDC_BALANCE, 0n)

      // Unlike a still-open progress modal, this order was dismissed before settling — reopening it
      // goes through the surplus-modal queue driven by `PendingOrdersUpdater`'s own polling cadence,
      // so it needs more room than the default 5s — mirrors [CS-59].
      await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!', { timeout: 15_000 })
      await swapPage.page.keyboard.press('Escape')

      // Buy amount is fixed by the order kind — it lands exactly on the typed amount, unlike the
      // sell side, which carries the app's own slippage buffer on top of the quote (see [CS-61]).
      await expect(swapPage.buyBalance).toHaveAttribute('title', '1 WETH', { timeout: 15_000 })
      await expect(swapPage.sellBalance).toHaveAttribute(
        'title',
        `${formatUnits(INITIAL_USDC_BALANCE - BigInt(posting.getPostedSellAmount()), 18)} USDC`,
        { timeout: 15_000 },
      )

      await expectActivityStatus(accountModal, 'Filled')
    })

    test('[CS-61] Buy order: approval amount includes slippage buffer @smoke', async ({
      swapPage,
      wallet,
      mocks,
      context,
      header,
      confirmModal,
    }) => {
      // Fixed rate (1 WETH = 2000 USDC) with zero fee/protocolFeeBps keeps the sell side a clean
      // round number derived from whatever buy amount was actually requested
      mockFixedRateQuote({ cowApi: mocks.cowApi, direction: 'buy', rate: { numerator: 1n, denominator: 2000n } })
      // Matches the quote's implied rate so the trade doesn't look like a loss against the fixture's
      // flat $1-per-token USD prices, which would otherwise trip the "Confirm Price Impact" dialog.
      mocks.usdPrices.setPrice(WETH, 2000)

      seedTrader(mocks, wallet, CHAIN_ID, {
        balances: { [WETH]: parseUnits('2', 18), [USDC]: 0n },
        // Precondition: sell token not yet approved.
        allowances: { [WETH]: 0n },
      })

      await swapPage.goto({ chainId: CHAIN_ID, sell: WETH, buy: USDC })
      await swapPage.enterBuyAmount('1000')
      await swapPage.waitForQuote()

      // Select "Partial approval" so the wallet requests a finite amount tied to the trade instead
      // of the default infinite (MaxUint256) approval — only then is there a "maximum sent" figure
      // to compare against.
      await swapPage.approveModeSelector.getByText('Partial approval').click()
      const approvalAmount = await readTitledAmount(swapPage.approveModeSelector)

      // Faking the approve() end-to-end instead of letting it broadcast for real — see
      // `mockApproveTransaction` for why both `eth_sendTransaction` and `eth_getTransactionReceipt`
      // need stubbing, and at two different layers.
      const approveMock = await mockApproveTransaction({
        context,
        wallet,
        allowances: mocks.allowances,
        chainId: CHAIN_ID,
        token: WETH,
      })

      await swapPage.approveButton.click()

      await expect(header.snackbarPopup).toContainText('Approve WETH', { timeout: 15_000 })

      // Approving a buy order auto-advances into the swap confirm screen. Its "Maximum sent" row is
      // the slippage-adjusted sell amount *without* the buy-order's +1% buffer
      // (`getOrderTypeReceiveAmounts.ts`) — a deliberately different figure from the approve amount
      // (`useAmountsToSignFromQuote.ts`'s `maximumSendSellAmount`, which adds that 1% on top).
      const maximumSentRaw = await readTitledAmount(confirmModal.amountRow('Maximum sent'))

      // What the toggle showed before signing matches the real approve() calldata's amount.
      expect(approvalAmount).toBe(approveMock.getApprovedAmount())

      // The core relationship: approval amount = "Maximum sent" + the 1% buy-order buffer.
      expect(approveMock.getApprovedAmount()).toBe((maximumSentRaw * 101n) / 100n)
    })

    test('[CS-62] Buy order: ETH as sell token (ETH-flow buy not supported) @smoke', async ({ swapPage }) => {
      await swapPage.goto({ chainId: CHAIN_ID })

      await swapPage.tokens.openInput()
      await swapPage.tokens.searchAndPick('ETH')

      // Selling native ETH as an EOA (`isEoaEthFlowAtom`) makes the buy field read-only —
      // there's no separate Sell/Buy order-kind toggle in this UI, so this is the only signal
      // that the order kind is locked to Sell.
      await expect(swapPage.outputAmount).not.toBeEditable()
    })

    test('[CS-63] Swap form: To field amount calculation @smoke', async ({
      setupTestConditions,
      swapPage,
      wallet,
      mocks,
    }) => {
      // Same technique as [CS-59]: zero out fee/protocolFeeBps so the displayed To-amount is an
      // exact, round multiple of the typed sell amount. Quote rate: 100 USDC -> 8 WETH, i.e. 1 WETH
      // = 12.5 USDC.
      mockFixedRateQuote({ cowApi: mocks.cowApi, rate: { numerator: 8n, denominator: 100n } })

      // Pricing WETH 2% below the quote's implied rate ($12.25 instead of $12.50) makes the buy
      // side's fiat value ($98) 2% under the sell side's ($100), producing a deterministic -2%
      // price impact instead of ~0%.
      mocks.usdPrices.setPrice(WETH, 12.25)

      // Set balances/allowances directly (both Sepolia test tokens report 18 decimals on-chain,
      // same quirk as [CS-59]) rather than via `setupTestConditions`'s own `balances`/`allowances`
      // options. `support/tokens.ts` already resolves this deployment's USDC to 18 decimals
      // correctly, so this is no longer required to work around a decimals mismatch — it's simply
      // how the test happens to be structured today.
      seedTrader(mocks, wallet, CHAIN_ID, {
        balances: { [USDC]: parseUnits('1000', 18), [WETH]: 0n },
        allowances: { [USDC]: parseUnits('1000', 18) },
      })

      await setupTestConditions({
        chainId: CHAIN_ID,
        tradeType: 'swap',
        sellToken: 'USDC',
        buyToken: 'WETH',
        sellAmount: '100',
      })

      // To amount = Sell amount × Price (from BE): 100 USDC × (8/100) = 8 WETH.
      await expect(swapPage.outputAmount).toHaveValue('8')

      // USD estimation shown for both fields.
      await expect(swapPage.sellFiatAmount).toContainText('$100')
      await expect(swapPage.buyFiatAmount).toContainText('$98')

      // Price impact shown near the USD estimation, with its explanatory tooltip.
      await expect(swapPage.priceImpact).toContainText('-2%')
      await swapPage.priceImpactTooltipTrigger.hover()
      await expect(swapPage.page.getByText('Price impact due to current liquidity levels')).toBeVisible()
    })

    test('[CS-64] Swap form: "Receive (incl. fees)" field calculation @smoke', async ({
      setupTestConditions,
      swapPage,
      mocks,
    }) => {
      const RATE = 2000n // 1 WETH = 2000 USDC

      // Non-zero protocol fee (1%) and network cost (also modeled as 1% of the sell amount, in
      // sell-token terms) so both the "Protocol fee" and "Network costs" tooltip rows render with
      // real amounts instead of "Free". Everything below is read back from the DOM rather than
      // hardcoded, so the exact numbers only need to be non-zero, not any particular value.
      mocks.cowApi.set('quote', (req) => {
        const defaults = req.defaults as { quote: Record<string, unknown> }
        const sellAmount = BigInt(defaults.quote.sellAmount as string)
        return {
          ...defaults,
          protocolFeeBps: '100',
          quote: {
            ...defaults.quote,
            feeAmount: (sellAmount / 100n).toString(),
            buyAmount: (sellAmount * RATE).toString(),
          },
        }
      })

      // Matches the quote's implied rate so the trade doesn't look like a loss against the
      // fixture's flat $1-per-token USD prices, which would otherwise trip the "Confirm Price
      // Impact" dialog — same technique as [CS-59].
      mocks.usdPrices.setPrice(WETH, Number(RATE))

      await setupTestConditions({
        chainId: CHAIN_ID,
        tradeType: 'swap',
        sellToken: 'WETH',
        buyToken: 'USDC',
        sellAmount: '10',
        balances: { WETH: '10', USDC: '0' },
        allowances: { WETH: '10' },
      })

      await swapPage.receiveAmountTooltipTrigger.hover()

      const tooltipBox = swapPage.page.getByText('Before costs', { exact: true }).locator('xpath=../..')
      await expect(tooltipBox).toBeVisible()
      await expect(tooltipBox.getByText('Protocol fee', { exact: true })).toBeVisible()
      await expect(tooltipBox.getByText('Network costs', { exact: true })).toBeVisible()
      await expect(tooltipBox.getByText('To', { exact: true })).toBeVisible()

      const readRowAmount = (label: string): Promise<bigint> =>
        readTitledAmount(tooltipBox.getByText(label, { exact: true }).locator('xpath=following-sibling::*[1]'))

      const beforeCosts = await readRowAmount('Before costs')
      const protocolFee = await readRowAmount('Protocol fee')
      const networkCosts = await readRowAmount('Network costs')
      const toAmount = await readRowAmount('To')

      // The core relationship: To = Before costs − Network costs − Protocol fee.
      expect(toAmount).toBe(beforeCosts - networkCosts - protocolFee)

      // The main "Receive (incl. fees)" field displays the same amount as the tooltip's "To" row.
      const receiveTitle = await swapPage.receiveAmountValue.getAttribute('title')
      const [receiveValue] = (receiveTitle ?? '').split(' ')
      expect(parseUnits(receiveValue, 18)).toBe(toAmount)
    })

    test('[CS-65] Swap form: "Minimum receive" calculation in Confirm modal @smoke', async ({
      setupTestConditions,
      swapPage,
      wallet,
      mocks,
      confirmModal,
    }) => {
      const RATE_NUM = 8n
      const RATE_DEN = 100n // quote rate: 100 USDC -> 8 WETH, i.e. 1 WETH = 12.5 USDC

      // Zero out fee/protocolFeeBps so "Expected to receive" (amountAfterFees) is an exact, round
      // multiple of the typed sell amount — same technique as [CS-59].
      mockFixedRateQuote({ cowApi: mocks.cowApi, rate: { numerator: RATE_NUM, denominator: RATE_DEN } })

      // Matches the quote's implied rate so the trade doesn't look like a loss against the
      // fixture's flat $1-per-token USD prices, which would otherwise trip the "Confirm Price
      // Impact" dialog — same technique as [CS-59].
      mocks.usdPrices.setPrice(WETH, Number(RATE_DEN) / Number(RATE_NUM))

      seedTrader(mocks, wallet, CHAIN_ID, {
        balances: { [USDC]: parseUnits('1000', 18), [WETH]: 0n },
        allowances: { [USDC]: parseUnits('1000', 18) },
      })

      await setupTestConditions({
        chainId: CHAIN_ID,
        tradeType: 'swap',
        sellToken: 'USDC',
        buyToken: 'WETH',
        sellAmount: '1000',
      })

      // Sets slippage tolerance, opens the Confirm modal, and returns "Minimum receive" after
      // checking it against "Expected to receive" and confirming it's read-only.
      const readMinimumReceiveAt = async (slippagePercent: string, slippageBps: bigint): Promise<bigint> => {
        await swapPage.setSlippage(slippagePercent)
        await swapPage.clickSwap()

        const expectedToReceive = await readTitledAmount(confirmModal.amountRow('Expected to receive'))
        const minimumReceive = await readTitledAmount(confirmModal.amountRow('Minimum receive'))

        // The core relationship: Minimum receive = Expected to receive × (1 − slippage%).
        expect(minimumReceive).toBe((expectedToReceive * (10_000n - slippageBps)) / 10_000n)

        // Read-only: rendered as plain text inside the row, not an editable control.
        const minimumReceiveRow = confirmModal.amountRow('Minimum receive')
        await expect(minimumReceiveRow.locator('input, textarea, [contenteditable]')).toHaveCount(0)

        await swapPage.page.keyboard.press('Escape')
        return minimumReceive
      }

      const minimumReceiveAt1Pct = await readMinimumReceiveAt('1', 100n)
      const minimumReceiveAt2Pct = await readMinimumReceiveAt('2', 200n)

      // Changing slippage tolerance in settings recalculates "Minimum receive".
      expect(minimumReceiveAt2Pct).not.toBe(minimumReceiveAt1Pct)
    })

    test('[CS-68] ETH-flow: place ETH sell order (EOA wallet) @smoke', async ({
      swapPage,
      wallet,
      context,
      confirmModal,
      accountModal,
      mocks,
    }) => {
      const INITIAL_ETH_BALANCE = parseUnits('1', 18)
      const SELL_AMOUNT = parseUnits('0.5', 18)

      // Selling native ETH doesn't POST an off-chain signed order like every other trade in this
      // file — it sends an on-chain `createOrder()` tx to a dedicated EthFlow contract instead. See
      // `mockEthFlowTransaction` for why this needs its own mock rather than `mockOrderPosting`.
      const ethFlow = await mockEthFlowTransaction({
        context,
        wallet,
        chainId: CHAIN_ID,
        initialEthBalance: INITIAL_ETH_BALANCE,
      })

      // `GET /api/v1/orders/{uid}`'s default fixture already answers any uid with a valid `open`
      // order — exactly what flips the order out of `creating` once polled. Withholding that
      // success (independently of `ethFlow.confirmMined()`, which only gates the *tx receipt*)
      // keeps the "Creating Order" state below observable instead of racing straight past it: the
      // real app moves through "Sending ETH" → "Sent ETH"/"Creating Order" → "Order Created" as two
      // separate gates (tx receipt, then order indexed), not one. See `mockEthFlowOrderIndexing` for
      // why this needs its own `order` override rather than `mockOrderPosting`.
      const orderIndexing = mockEthFlowOrderIndexing(mocks.cowApi, ethFlow)

      // For an ETH-flow order the wei sent as `tx.value` is sellAmount + the quote's feeAmount
      // (there's no separate ERC-20 fee deduction to hide it in) — zeroing it out, same technique as
      // [CS-59]/[CS-63]/[CS-64], keeps the sent value and the post-tx balance round numbers below.
      // No `rate` needed: this order's buyAmount is never asserted on, only that fees don't skew it.
      mockFixedRateQuote({ cowApi: mocks.cowApi })

      await swapPage.goto({ chainId: CHAIN_ID })

      // Typed before switching the sell token to ETH, not after: selecting a token with no amount
      // set yet auto-fills 1 whole unit of it (`useSetupTradeAmountsFromUrl`'s
      // `!isAtLeastOneAmountIsSetRef.current` default), which races the real typed amount's own
      // debounced quote fetch and can win under load — the mocked wallet balance here is exactly
      // 1 ETH, so that default is indistinguishable from "sold everything" when it wins. Typing an
      // amount first (against the default WETH sell token) marks one as already set, so switching to
      // ETH afterwards carries the typed amount over instead of triggering the default.
      await swapPage.enterSellAmount('0.5')
      await swapPage.tokens.openInput()
      await swapPage.tokens.searchAndPick('ETH')
      await swapPage.tokens.openOutput()
      await swapPage.tokens.searchAndPick('USDC')

      await expect(swapPage.sellBalance).toHaveAttribute('title', '1 ETH')
      await expect(swapPage.inputAmount).toHaveValue('0.5')
      await swapPage.waitForQuote()
      await expect(swapPage.inputAmount).toHaveValue('0.5')

      await swapPage.clickSwap()
      await confirmModal.confirm()

      // Confirming signs/sends the on-chain creation tx directly (`eth_sendTransaction`, stubbed by
      // `mockEthFlowTransaction`) — there's no separate off-chain EIP-712 signature for this flow.
      await expect.poll(() => ethFlow.getSentValue()).toBe(SELL_AMOUNT)

      // Before the mocked receipt confirms, `EthFlowStepper`'s step 1 reads "Sending ETH" — matched
      // `exact` since an SVG `<desc>` elsewhere on the page repeats the same text non-visibly.
      await expect(swapPage.page.getByText('Sending ETH', { exact: true })).toBeVisible()

      // The creation tx hash is linked right there as step 1's own "View transaction" explorer link,
      // verbatim in its `href` — scoped by accessible name since the snackbar in the corner links
      // the same hash via its own "View on Etherscan" links.
      const viewTransactionLink = swapPage.page.getByRole('link', { name: /view transaction/i })
      await expect(viewTransactionLink).toHaveAttribute('href', new RegExp(ethFlow.getTxHash()))

      // Let the mocked creation tx "mine" — step 1 becomes "Sent ETH" and step 2 becomes "Creating
      // Order", since the order-by-uid poll above is still withheld (`orderIndexing` isn't marked
      // indexed yet).
      ethFlow.confirmMined()

      // "Creating Order" (`EthFlowStepper`'s step-2 label) has no stable container to scope to: the
      // regular `#order-progress-bar-modal` div isn't even mounted yet at this point (its own setup
      // is disabled while the order is still `creating`), so this checks the text directly. Getting
      // here requires the app to notice the mocked receipt, which it only rechecks on a new block —
      // real Sepolia block time, not a fixed poll interval — hence the generous timeout.
      await expect(swapPage.page.getByText('Creating Order', { exact: true })).toBeVisible({ timeout: 30_000 })

      // Let the order-by-uid poll start succeeding — this is what flips the order from `creating` to
      // `pending`, rendered in the activities list as "Open".
      orderIndexing.markIndexed()

      await expectActivityStatus(accountModal, 'Open', { timeout: 15_000 })

      // With the order indexed, `EthFlowStepper`'s step 3 becomes the active step: "Receive USDC",
      // pending — order-progress hasn't reported a fill yet.
      await expect(swapPage.page.getByText('Receive USDC', { exact: true })).toBeVisible()

      // Settle the order now that it's posted and confirmed — mirrors `mockOrderPosting.fulfill()`,
      // minus the `postOrder` bookkeeping that flow never goes through. Credits the buy-side balance
      // with the amount actually encoded in the sent `createOrder()` calldata, and flips the `order`
      // override above to report `fulfilled`.
      const orderParams = ethFlow.getOrderParams()
      if (!orderParams) throw new Error('mockEthFlowTransaction: fulfill attempted before an order was sent')
      seedTrader(mocks, wallet, CHAIN_ID, { balances: { [USDC]: orderParams.buyAmount } })
      ethFlow.confirmFilled()

      // Once truly fulfilled, `TransactionSubmittedContent` stops rendering `EthFlowStepper`
      // (`!isFinished`) and shows the same generic completed screen every other order type uses —
      // there's no "Received USDC" checkmark state to catch, the stepper disappears entirely. This
      // is what makes `#order-progress-bar-modal` get mounted in the first place, per [CS-59]/[CS-60].
      await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!', { timeout: 15_000 })

      await expectActivityStatus(accountModal, 'Filled', { timeout: 15_000 })

      // The order-submitted view is still covering the swap form (`CurrencyInputPanel` only renders
      // a balance while `!disabled`) — dismiss it the same way [CS-59]/[CS-60] do.
      await swapPage.page.keyboard.press('Escape')

      // Native ETH leaves the wallet as soon as the creation tx is sent (it's the tx's own `value`,
      // not a separate settlement step) — by the time the order shows "Open" it's already reflected
      // here.
      await expect(swapPage.sellBalance).toHaveAttribute('title', '0.5 ETH', { timeout: 15_000 })
      await expect(swapPage.buyBalance).toHaveAttribute('title', `${formatUnits(orderParams.buyAmount, 18)} USDC`, {
        timeout: 15_000,
      })
    })

    test('[CS-71] ETH-flow: order status lifecycle', async ({
      swapPage,
      wallet,
      context,
      confirmModal,
      accountModal,
      mocks,
    }) => {
      const INITIAL_ETH_BALANCE = parseUnits('1', 18)
      const SELL_AMOUNT = parseUnits('0.5', 18)

      // Same ETH-flow mocking setup as [CS-68] — see that test's comments for why this needs
      // `mockEthFlowTransaction` (on-chain `createOrder()`, no off-chain signature) and an inlined
      // `order` override (no `postOrder` call exists for this flow to hook via `mockOrderPosting`).
      const ethFlow = await mockEthFlowTransaction({
        context,
        wallet,
        chainId: CHAIN_ID,
        initialEthBalance: INITIAL_ETH_BALANCE,
      })

      const orderIndexing = mockEthFlowOrderIndexing(mocks.cowApi, ethFlow)

      mockFixedRateQuote({ cowApi: mocks.cowApi })

      await swapPage.goto({ chainId: CHAIN_ID })

      // Typed before switching the sell token to ETH — dodges the auto-fill race documented at
      // [CS-68].
      await swapPage.enterSellAmount('0.5')
      await swapPage.tokens.openInput()
      await swapPage.tokens.searchAndPick('ETH')
      await swapPage.tokens.openOutput()
      await swapPage.tokens.searchAndPick('USDC')

      await expect(swapPage.sellBalance).toHaveAttribute('title', '1 ETH')
      await expect(swapPage.inputAmount).toHaveValue('0.5')
      await swapPage.waitForQuote()
      await expect(swapPage.inputAmount).toHaveValue('0.5')

      await swapPage.clickSwap()
      await confirmModal.confirm()

      // Creating (tx sent, not yet mined): "Sending ETH" is the active step, and the tx hash is
      // already linked as its "View transaction" explorer link — same signals as [CS-68].
      await expect.poll(() => ethFlow.getSentValue()).toBe(SELL_AMOUNT)
      await expect(swapPage.page.getByText('Sending ETH', { exact: true })).toBeVisible()

      const viewTransactionLink = swapPage.page.getByRole('link', { name: /view transaction/i })
      await expect(viewTransactionLink).toHaveAttribute('href', new RegExp(ethFlow.getTxHash()))

      // Still Creating (tx mined, order not indexed yet): "Creating Order" — the explorer link still
      // points at the same creation tx.
      ethFlow.confirmMined()
      await expect(swapPage.page.getByText('Creating Order', { exact: true })).toBeVisible({ timeout: 30_000 })
      await expect(viewTransactionLink).toHaveAttribute('href', new RegExp(ethFlow.getTxHash()))

      // Open (order indexed by the backend).
      orderIndexing.markIndexed()
      await accountModal.open()
      await accountModal.activitiesList.scrollIntoViewIfNeeded()
      await expect(accountModal.activitiesList).toContainText('Open', { timeout: 15_000 })

      // Cancellable while Open (`isOrderCancellable` gates on order status alone, not order kind) —
      // precondition for the "no longer possible" check once Filled, below.
      const cancelLink = accountModal.activitiesList.getByText('Cancel order', { exact: true })
      await expect(cancelLink).toBeVisible()
      await accountModal.close()

      // The order-submitted view is still covering the swap form (`CurrencyInputPanel` only renders
      // a balance while `!disabled`, same as [CS-68]) — dismiss it to read the sell balance. Native
      // ETH leaves the wallet as soon as the creation tx is sent (it's the tx's own `value`, not a
      // separate settlement step), so it's already reflected here even though the order only just
      // reached "Open".
      await swapPage.page.keyboard.press('Escape')
      await expect(swapPage.sellBalance).toHaveAttribute('title', '0.5 ETH', { timeout: 15_000 })

      // Filled: settle the order — mirrors [CS-68]'s `fulfill()`-equivalent inline logic. Unlike
      // [CS-68] (which keeps the progress view open throughout), it was already dismissed above to
      // read the sell balance — the ETH-flow progress view doesn't reopen itself the way the regular
      // (off-chain-signed) flow's surplus-modal queue does at [CS-60], so status/balance here are
      // read via the activities list and swap form directly instead of waiting on it to reappear.
      const orderParams = ethFlow.getOrderParams()
      if (!orderParams) throw new Error('mockEthFlowTransaction: fulfill attempted before an order was sent')
      seedTrader(mocks, wallet, CHAIN_ID, { balances: { [USDC]: orderParams.buyAmount } })
      ethFlow.confirmFilled()

      await expect(swapPage.buyBalance).toHaveAttribute('title', `${formatUnits(orderParams.buyAmount, 18)} USDC`, {
        timeout: 15_000,
      })

      await accountModal.open()
      await accountModal.activitiesList.scrollIntoViewIfNeeded()
      await expect(accountModal.activitiesList).toContainText('Filled', { timeout: 15_000 })

      // No longer cancellable once Filled — `isOrderCancellable` only allows CREATING/PENDING.
      await expect(cancelLink).toBeHidden()
      await accountModal.close()
    })

    test('[CS-79] Slippage: dynamic mode defaults and range (regular flow) @smoke', async ({
      setupTestConditions,
      swapPage,
      context,
    }) => {
      let dynamicSlippageBps = 20 // 0.2% — comfortably under the 2% banner threshold
      await context.route(/bff\.(?:barn\.)?cow\.fi\/\d+\/markets\/.*\/slippageTolerance$/i, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ slippageBps: dynamicSlippageBps }),
        })
      })

      await setupTestConditions({
        chainId: CHAIN_ID,
        tradeType: 'swap',
        sellToken: 'WETH',
        buyToken: 'USDC',
        sellAmount: '0.5',
        balances: { WETH: '1' },
        allowances: { WETH: '1' },
      })

      await swapPage.settingsDialogButton.click()

      const slippageInput = swapPage.slippageInput
      const adjustedBanner = swapPage.page.getByText(/Slippage adjusted to [\d.]+% to ensure quick execution/)

      const readPlaceholderPercent = async (): Promise<number> =>
        Number((await slippageInput.getAttribute('placeholder')) ?? NaN)

      // Dynamic ("Auto") slippage is selected by default: the input holds no custom value, only a
      // placeholder showing the currently suggested percentage, tracking the mocked suggestion.
      // `setupTestConditions`'s `waitForQuote()` only clears once the first ("fast") quote response
      // lands — the smart-slippage hook ignores that one, so the placeholder settles slightly later.
      await expect(slippageInput).toHaveValue('')
      await expect.poll(readPlaceholderPercent, { timeout: 15_000 }).toBeCloseTo(bpsToPercentage(dynamicSlippageBps), 0)

      // The suggested value stays under 2%, so the "adjusted" banner doesn't show.
      await expect(adjustedBanner).toBeHidden()

      // Range check: min/max aren't shown as static copy anywhere in the UI — the only concrete
      // signal is this validation message, triggered by typing a value outside [0, 50] for the
      // regular ERC-20 flow (native-ETH-sell orders have a separate 0.5% floor, not covered here —
      // see the not-yet-written [CS-81]).
      // `.fill('60')` was observed to silently no-op here (value stays empty) — `pressSequentially`
      // (real keystrokes) is what actually lands the value; unclear why, but empirically reliable.
      await slippageInput.click()
      await slippageInput.pressSequentially('60')
      await expect(swapPage.page.getByText('Enter slippage percentage between 0% and 50%.')).toBeVisible()

      // Blurring an out-of-range value reverts to dynamic mode and clears the input — same as
      // `useSlippageInput`'s `onSlippageInputBlur` does for a user clicking away without confirming
      // an invalid custom value.
      await slippageInput.blur()
      await expect(slippageInput).toHaveValue('')

      // Push the suggested value clearly above the 2% banner threshold and force a fresh quote to
      // pick it up — demonstrates the value adjusting automatically as conditions (the mocked
      // suggestion) change, and that the banner appears once it clears the threshold.
      dynamicSlippageBps = 900 // 9%
      await swapPage.page.keyboard.press('Escape')
      await swapPage.enterSellAmount('0.6')
      await swapPage.waitForQuote()
      await swapPage.settingsDialogButton.click()

      // `waitForQuote()` only waits out the loading spinner for the first ("fast") quote response —
      // the smart-slippage hook explicitly ignores fast quotes and keeps the last valid value until
      // the slower, BFF-informed quote lands, so the placeholder needs its own poll rather than a
      // single read right after the spinner clears.
      await expect.poll(readPlaceholderPercent, { timeout: 15_000 }).toBeGreaterThan(2)
      expect(await readPlaceholderPercent()).toBeCloseTo(bpsToPercentage(dynamicSlippageBps), 0)
      await expect(adjustedBanner).toBeVisible({ timeout: 15_000 })

      const bannerText = (await adjustedBanner.textContent()) ?? ''
      const [, adjustedPercent] = /Slippage adjusted to ([\d.]+)% to ensure quick execution/.exec(bannerText) ?? []
      expect(Number(adjustedPercent)).toBeGreaterThan(2)
    })

    test('[CS-87] Token not approved (non-permittable, no bundling): approval button shown @smoke', async ({
      swapPage,
      wallet,
      mocks,
      context,
      header,
      confirmModal,
    }) => {
      // WETH is the non-permittable token already used throughout this file (no EIP-2612 support,
      // so there's never a cached permit signature to fall back to) — `TradeApproveButton`'s
      // `noCachedPermit` is therefore always true for it, which is what selects the "Approve and
      // Swap" label (`useGetConfirmButtonLabel('approve', ...)`) over the plain "Swap" one.
      // "Wallet does not support bundling" doesn't need separate setup: this suite's mock EOA wallet
      // is a plain injected-provider wallet, not a smart-contract wallet capable of batching approve
      // + swap into one transaction, so it already exercises the two-separate-transactions path this
      // scenario is about.
      mockFixedRateQuote({ cowApi: mocks.cowApi, rate: { numerator: 2000n, denominator: 1n } })
      mocks.usdPrices.setPrice(WETH, 2000)

      seedTrader(mocks, wallet, CHAIN_ID, {
        balances: { [WETH]: parseUnits('2', 18), [USDC]: 0n },
        // Precondition: sell token has no existing approval.
        allowances: { [WETH]: 0n },
      })

      // No `mockOrderPosting` here — this test only needs to know an order was (or wasn't yet)
      // posted, not settle it, so a bare flag on the `postOrder` override is enough to prove
      // ordering against the approval below.
      let orderPosted = false
      mocks.cowApi.set('postOrder', (req) => {
        orderPosted = true
        return req.defaults
      })

      await swapPage.goto({ chainId: CHAIN_ID, sell: WETH, buy: USDC })
      await swapPage.enterSellAmount('1')
      await swapPage.waitForQuote()

      // The action button reads "Approve and Swap" — not a generic "Approve" — confirming the
      // single-button, non-permittable flow this scenario is about.
      await expect(swapPage.approveButton).toContainText('Swap')

      // Faking the approve() end-to-end instead of letting it broadcast for real — see
      // `mockApproveTransaction` for why both `eth_sendTransaction` and `eth_getTransactionReceipt`
      // need stubbing, and at two different layers.
      const approveMock = await mockApproveTransaction({
        context,
        wallet,
        allowances: mocks.allowances,
        chainId: CHAIN_ID,
        token: WETH,
      })

      await swapPage.approveButton.click()
      await expect(header.snackbarPopup).toContainText('Approve WETH', { timeout: 15_000 })

      // The approval transaction is sent — and, since approving auto-advances into the swap confirm
      // screen without posting anything, no order exists yet at this point.
      expect(approveMock.getApprovedAmount()).toBeDefined()
      expect(orderPosted).toBe(false)

      // Only placing the swap from here on posts the order — proving the approval tx really did
      // happen before it, not just alongside it.
      await confirmModal.confirm()
      await expect.poll(() => orderPosted).toBe(true)
    })

    test('[CS-99] Token approval: gasless approval (EIP-2612 permit) @smoke', async ({
      swapPage,
      wallet,
      mocks,
      confirmModal,
      context,
    }) => {
      // Whether a token supports EIP-2612 permit isn't decided by probing the token's own contract
      // in this app (that on-chain fallback needs a real `nonces()`/`permit()`-implementing contract,
      // which this suite's fake Sepolia "USDC" isn't) — it's resolved from a pre-generated list
      // fetched from `files.cow.fi` first (`usePreGeneratedPermitInfo.ts`), and the on-chain probe is
      // skipped entirely once that list responds. Mocking this CDN endpoint is enough to make the
      // fake token register as permit-compatible.
      await context.route(/files\.cow\.fi\/token-lists\/PermitInfo\.\d+\.json$/i, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ [USDC.toLowerCase()]: { type: 'eip-2612', name: 'USDC', version: '2' } }),
        })
      })

      // Clicking the action button is identical either way (same `#approve-trade-button`, same
      // "Approve and Swap" label, see [CS-87]) — `useApproveAndSwap`'s `handlePermit()` branches on
      // token support *inside* the click handler: a permit-supported token signs a typed-data
      // message and skips the on-chain `approve()` call entirely.
      seedTrader(mocks, wallet, CHAIN_ID, {
        balances: { [USDC]: parseUnits('1500', 18), [WETH]: 0n },
        // Precondition: no existing on-chain approval — irrelevant to the permit path itself, but
        // keeps this consistent with [CS-87] and confirms the button renders regardless of the reason.
        allowances: { [USDC]: 0n },
      })

      // Matches the quote's implied rate so the trade doesn't look like a loss against the fixture's
      // flat $1-per-token USD prices, which would otherwise trip the "Confirm Price Impact" dialog.
      mocks.usdPrices.setPrice(WETH, 2000)
      mockFixedRateQuote({ cowApi: mocks.cowApi, rate: { numerator: 1n, denominator: 2000n } })

      let uploadedAppData: string | undefined
      let uploadedAppDataHash: string | undefined
      mocks.cowApi.set('putAppData', (req) => {
        uploadedAppData = (req.body as { fullAppData: string }).fullAppData
        uploadedAppDataHash = req.params.hash
        return req.params.hash
      })

      let postedOrderAppDataHash: string | undefined
      mocks.cowApi.set('postOrder', (req) => {
        postedOrderAppDataHash = (req.body as { appDataHash?: string }).appDataHash
        return req.defaults
      })

      await swapPage.goto({ chainId: CHAIN_ID, sell: USDC, buy: WETH })
      await swapPage.enterSellAmount('1000')
      await swapPage.waitForQuote()

      await expect(swapPage.approveButton).toContainText('Approve and Swap')
      await swapPage.approveButton.click()

      // The wallet is asked to sign the permit — an EIP-712 `Permit` message, not a transaction —
      // before the swap gets confirmed below. This suite's mock wallet already signs whatever
      // typed-data it's handed (no special stub needed, see `walletEngine.ts`), so the request is
      // read back from its own call log rather than mocked.
      await expect.poll(() => wallet.rpcCalls('eth_signTypedData_v4').length).toBeGreaterThan(0)
      const permitSignRequest = wallet
        .rpcCalls('eth_signTypedData_v4')
        .map((call) => JSON.parse(call.params[1] as string))
        .find((typedData) => typedData.primaryType === 'Permit')
      expect(areAddressesEqual(permitSignRequest?.domain?.verifyingContract, USDC)).toBe(true)

      // No on-chain approval transaction is ever sent — the permit signature replaces it entirely.
      expect(wallet.rpcCalls('eth_sendTransaction')).toHaveLength(0)

      // Signing auto-advances into the swap confirm screen, same as a real approval does.
      await confirmModal.confirm()

      // The signed permit is what gets "executed with the swap settlement": it's uploaded as a
      // pre-interaction CoW Hook on the order's appData, not a separate approve() call.
      await expect.poll(() => uploadedAppData).toBeDefined()
      const appData = JSON.parse(uploadedAppData as string)
      const permitHook = appData.metadata.hooks.pre.find((hook: { target?: string }) =>
        areAddressesEqual(hook.target, USDC),
      )
      expect(permitHook?.dappId).toBe('cow-swap://libs/hook-dapp-lib/permit')

      // The permit hook alone doesn't prove it's actually part of *this* order — the signed order
      // must reference the exact appData hash that content was uploaded under, or the permit hook
      // would never be picked up by the settlement.
      await expect.poll(() => postedOrderAppDataHash).toBeDefined()
      expect(postedOrderAppDataHash).toBe(uploadedAppDataHash)
    })

    test('[CS-103] Wrap ETH → WETH via swap form @smoke', async ({ swapPage, wallet, mocks, context }) => {
      const INITIAL_ETH_BALANCE = parseUnits('1', 18)
      const WRAP_AMOUNT = parseUnits('0.5', 18)

      // Selecting ETH as sell and WETH as buy isn't a CoW order at all — `validateTradeForm.ts`
      // recognizes it as `WrapUnwrapFlow` and swaps in a local `deposit()` call on the WETH contract
      // (`legacy/hooks/useWrapCallback.ts`) instead of the usual quote/sign/post flow. See
      // `mockWrapTransaction` for why this needs its own mock rather than `mockEthFlowTransaction`
      // (no order, no CoW API involvement at all) or `mockApproveTransaction` (different calldata).
      const wrapTx = await mockWrapTransaction({
        context,
        wallet,
        balances: mocks.balances,
        chainId: CHAIN_ID,
        wethToken: WETH,
        initialEthBalance: INITIAL_ETH_BALANCE,
        initialWethBalance: 0n,
      })

      seedTrader(mocks, wallet, CHAIN_ID, { balances: { [WETH]: 0n } })

      await swapPage.goto({ chainId: CHAIN_ID })

      // Typed before switching the sell token to ETH, not after — see [CS-68]'s note on
      // `useSetupTradeAmountsFromUrl`'s 1-unit auto-fill racing the real typed amount when a token
      // with no amount set yet is selected. That mitigation alone isn't airtight for a *native* ETH
      // pick specifically: selecting a new input currency awaits `crossChainFamilySwitch()` before
      // applying the selection (`useOpenTokenSelectWidget.ts`), a real microtask gap that can still
      // let the 1-unit default win under CI load. Retyping once both switches have landed removes
      // any dependency on that race — there's no further currency switch left to lose the amount to.
      await swapPage.enterSellAmount('0.5')
      await swapPage.tokens.openInput()
      await swapPage.tokens.searchAndPick('ETH')
      await swapPage.tokens.openOutput()
      await swapPage.tokens.searchAndPick('WETH')
      await swapPage.enterSellAmount('0.5')

      await expect(swapPage.sellBalance).toHaveAttribute('title', '1 ETH')
      await expect(swapPage.inputAmount).toHaveValue('0.5')

      // The action button reads "Wrap", not "Swap" — this validation state's button doesn't carry
      // the `#do-trade-button` id the ordinary swap/approve states do (same gap found in [CS-102]),
      // so `swapPage.wrapButton` matches it by its own text instead of `swapPage.swapButton`.
      await expect(swapPage.wrapButton).toBeVisible()
      await swapPage.wrapButton.click()

      // Confirming signs/sends the on-chain `deposit()` tx directly — there's no off-chain signature
      // step for a wrap, and no CoW API call of any kind.
      await expect.poll(() => wrapTx.getSentValue()).toBe(WRAP_AMOUNT)
      wrapTx.confirmMined()

      // ETH decreases and WETH increases by the same wrapped amount.
      await expect(swapPage.sellBalance).toHaveAttribute('title', '0.5 ETH', { timeout: 15_000 })
      await expect(swapPage.buyBalance).toHaveAttribute('title', '0.5 WETH', { timeout: 15_000 })
    })

    test('[CS-104] Unwrap WETH → ETH via swap form @smoke', async ({ swapPage, wallet, mocks, context }) => {
      const INITIAL_WETH_BALANCE = parseUnits('1', 18)
      const INITIAL_ETH_BALANCE = parseUnits('1', 18)
      const UNWRAP_AMOUNT = parseUnits('0.5', 18)

      // Selecting WETH as sell (the default) and ETH as buy isn't a CoW order at all either — the
      // reverse of [CS-103]: `validateTradeForm.ts` still recognizes it as `WrapUnwrapFlow`, but
      // routes to a local `withdraw()` call on the WETH contract instead of `deposit()`
      // (`legacy/hooks/useWrapCallback.ts`'s `unwrapContractCall`). See `mockUnwrapTransaction` for
      // why this needs its own mock rather than reusing `mockWrapTransaction` directly — `withdraw`'s
      // amount is a calldata argument, not the tx's own `value` the way `deposit`'s is.
      const unwrapTx = await mockUnwrapTransaction({
        context,
        wallet,
        balances: mocks.balances,
        chainId: CHAIN_ID,
        wethToken: WETH,
        initialEthBalance: INITIAL_ETH_BALANCE,
        initialWethBalance: INITIAL_WETH_BALANCE,
      })

      seedTrader(mocks, wallet, CHAIN_ID, { balances: { [WETH]: INITIAL_WETH_BALANCE } })

      await swapPage.goto({ chainId: CHAIN_ID })

      // WETH is already the default sell token on Sepolia (see known quirks), so only the buy side
      // needs switching — typed before switching, not after, same auto-fill race as [CS-68]/[CS-103].
      await swapPage.enterSellAmount('0.5')
      await swapPage.tokens.openOutput()
      await swapPage.tokens.searchAndPick('ETH')
      await swapPage.enterSellAmount('0.5')

      await expect(swapPage.sellBalance).toHaveAttribute('title', '1 WETH')
      await expect(swapPage.inputAmount).toHaveValue('0.5')

      // The action button reads "Unwrap", not "Swap" — same gap as [CS-103]'s "Wrap" button, which
      // doesn't carry the `#do-trade-button` id the ordinary swap/approve states do.
      await expect(swapPage.unwrapButton).toBeVisible()
      await swapPage.unwrapButton.click()

      // Confirming signs/sends the on-chain `withdraw()` tx directly — there's no off-chain
      // signature step for an unwrap, and no CoW API call of any kind.
      await expect.poll(() => unwrapTx.getSentValue()).toBe(UNWRAP_AMOUNT)
      unwrapTx.confirmMined()

      // WETH decreases and ETH increases by the same unwrapped amount — 1:1, no slippage or
      // protocol fee, since this flow never goes through a quote at all.
      await expect(swapPage.sellBalance).toHaveAttribute('title', '0.5 WETH', { timeout: 15_000 })
      await expect(swapPage.buyBalance).toHaveAttribute('title', '1.5 ETH', { timeout: 15_000 })
    })

    test('[CS-111] Cancel market order: off-chain soft cancellation (EOA) @smoke', async ({
      swapPage,
      wallet,
      mocks,
      accountModal,
    }) => {
      // Deliberately not created through the swap UI (per spec) — seeded directly via
      // `mockCancellableOrder` instead. See that helper for why mocking `accountOrders` is the
      // correct lever (not something reverse-engineered from localStorage).
      const cancellableOrder = mockCancellableOrder({
        cowApi: mocks.cowApi,
        owner: wallet.address,
        sellToken: WETH,
        buyToken: USDC,
        sellAmount: parseUnits('1', 18),
        buyAmount: parseUnits('2000', 18),
      })

      // `OrdersFromApiUpdater` only turns a fetched order into local state once it can resolve both
      // its sell/buy tokens from `useAllActiveTokens()` — selecting them via the real dropdown UI,
      // same as [CS-59]/[CS-60], is what gets them into that set (no order is ever created through
      // this UI, only the token registration piggybacks on it).
      await swapPage.goto({ chainId: CHAIN_ID })
      await selectTokens(swapPage, 'WETH', 'USDC')

      // `OrdersFromApiUpdater` only picks this up once its own effects settle — longer than the
      // default 5s.
      await accountModal.open()
      await accountModal.activitiesList.scrollIntoViewIfNeeded()
      await expect(accountModal.activitiesList).toContainText('Open', { timeout: 15_000 })

      const cancelLink = accountModal.activitiesList.getByText('Cancel order', { exact: true })
      await expect(cancelLink).toBeVisible()
      await cancelLink.click()

      // Clicking "Cancel order" only opens a confirmation modal (`RequestCancellationModal`) — the
      // actual off-chain signature + DELETE only fire once this button is clicked too.
      await accountModal.requestCancellationButton.click()

      // The wallet is asked to sign an `OrderCancellations` EIP-712 message (`orderUids: bytes[]`,
      // see `@cowprotocol/sdk-contracts-ts`'s `CANCELLATIONS_TYPE_FIELDS`) — not a transaction.
      await expect.poll(() => cancellableOrder.wasCancelRequested()).toBe(true)
      const cancellationSignRequest = wallet
        .rpcCalls('eth_signTypedData_v4')
        .map((call) => JSON.parse(call.params[1] as string))
        .find((typedData) => typedData.primaryType === 'OrderCancellations')
      expect(cancellationSignRequest?.message?.orderUids).toContain(cancellableOrder.uid)

      // No gas transaction is ever sent for a soft cancellation.
      expect(wallet.rpcCalls('eth_sendTransaction')).toHaveLength(0)

      // The API now considers the order invalidated — the order's own `creationDate` hasn't cleared
      // `PENDING_ORDERS_BUFFER` yet, so the UI shows the transient "Cancelling..." state first
      // (`isCancelling: apiStatus === 'pending' && order.invalidated`, `OrdersFromApiUpdater.ts`).
      cancellableOrder.markCancelled()
      await expect(accountModal.activitiesList).toContainText('Cancelling...', { timeout: 45_000 })

      // Once enough real time has passed since `creationDate`, `isOrderCancelled` flips true and the
      // order settles into its final "Cancelled" state — genuinely time-dependent, hence the long
      // timeout rather than a flaw in the mock.
      await expect(accountModal.activitiesList).toContainText('Cancelled', { timeout: 60_000 })
    })

    test('[CS-118] Progress bar: regular order happy path — steps 1 → 2 → 3 → 4', async ({
      swapPage,
      tradePage,
      wallet,
      confirmModal,
      mocks,
    }) => {
      // Same 18-decimals quirk as [CS-59].
      const INITIAL_USDC_BALANCE = parseUnits('1500', 18)
      const BUY_RATE_NUM = 804n
      const BUY_RATE_DEN = 1_000_000n // quote buyAmount ~= 0.804 WETH per 1000 USDC sold, pre-slippage

      mockFixedRateQuote({ cowApi: mocks.cowApi, rate: { numerator: BUY_RATE_NUM, denominator: BUY_RATE_DEN } })

      const posting = tradePage.mockOrderPosting(mocks.cowApi, wallet.address)

      // Matches the quote's implied rate so the trade doesn't look like a loss against the
      // fixture's flat $1-per-token USD prices, which would otherwise trip the "Confirm Price
      // Impact" dialog — same technique as [CS-59].
      mocks.usdPrices.setPrice(WETH, Number(BUY_RATE_DEN) / Number(BUY_RATE_NUM))

      seedTrader(mocks, wallet, CHAIN_ID, {
        balances: { [USDC]: INITIAL_USDC_BALANCE, [WETH]: 0n },
        allowances: { [USDC]: INITIAL_USDC_BALANCE },
      })

      await swapPage.goto({ chainId: CHAIN_ID })

      // Typed before selecting tokens, not after — dodges the auto-fill race documented at [CS-59].
      await swapPage.enterSellAmount('1000')
      await selectTokens(swapPage, 'USDC', 'WETH')
      await swapPage.waitForQuote()

      await swapPage.clickSwap()
      await confirmModal.confirm()

      // Step 1 (INITIAL, backend OPEN/SCHEDULED) — order just signed and posted, competition hasn't
      // started yet.
      await expect(swapPage.orderProgressBarModal).toContainText('Batching orders')

      // Step 2 (SOLVING, backend ACTIVE — the default `orderStatus` fixture) — competition started,
      // solvers searching for the best price. All 4 steps' titles are always rendered together
      // (`StepsWrapper`), so `SolvingStep`'s own body text ("best price wins") is what distinguishes
      // this step as the active one, same as [CS-59]. `MINIMUM_STEP_DISPLAY_TIME` holds step 1 on
      // screen for at least 5s before advancing here, hence the longer timeout.
      await expect(swapPage.orderProgressBarModal).toContainText('best price wins', { timeout: 15_000 })

      // Step 3 (EXECUTING) — solver picked a winner, submitting the trade on-chain. `ExecutingStep`
      // overrides that step's own title to "Best price found!" while active.
      posting.markExecuting()
      await expect(swapPage.orderProgressBarModal).toContainText('Best price found!', { timeout: 15_000 })

      // Settle the order now that it's posted and confirmed.
      posting.fulfill(mocks.balances, CHAIN_ID, INITIAL_USDC_BALANCE, 0n)

      // Step 4 (FINISHED, backend TRADED) — trade settled, filled confirmation shown.
      await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!', { timeout: 15_000 })

      // `FinishedStep`'s "You sold"/"Received" rows render the order's actual executed amounts, not
      // the originally quoted ones — cross-check them against what `fulfill()` actually settled the
      // order at, same as [CS-59].
      const soldAmountRow = swapPage.orderProgressBarModal.locator('span', { hasText: 'You sold' }).first()
      const receivedAmountRow = swapPage.orderProgressBarModal.locator('span', { hasText: 'Received' }).first()
      expect(await readTitledAmount(soldAmountRow)).toBe(BigInt(posting.getPostedSellAmount()))
      expect(await readTitledAmount(receivedAmountRow)).toBe(BigInt(posting.getPostedBuyAmount()))
    })

    test('[CS-127] Swap form: protocol fee applied at 0.02% (2 bps) for standard token pair @smoke', async ({
      setupTestConditions,
      swapPage,
      mocks,
    }) => {
      const RATE = 2000n // 1 WETH = 2000 USDC — arbitrary, same convention as [CS-64]

      // `protocolFeeBps` is a top-level field on the quote response, not nested under `quote` (see
      // `useTradeQuoteProtocolFee.ts`). Zeroing `feeAmount` (network cost) removes that term from
      // "Before costs" entirely, so `protocolFee / beforeCosts` reduces to exactly
      // `protocolFeeBps / 10000` instead of being diluted by an unrelated network-cost fraction —
      // the SDK reverses a sell order's protocol fee out of `buyAmount` as
      // `buyAmount * protocolFeeBps / (10000 - protocolFeeBps)`, so with `feeAmount = 0`:
      // `beforeCosts = buyAmount + protocolFee = buyAmount * 10000 / (10000 - protocolFeeBps)`, and
      // `protocolFee / beforeCosts = protocolFeeBps / 10000` exactly (mod integer-division rounding).
      mocks.cowApi.set('quote', (req) => {
        const defaults = req.defaults as { quote: Record<string, unknown> }
        const sellAmount = BigInt(defaults.quote.sellAmount as string)
        return {
          ...defaults,
          protocolFeeBps: '2',
          quote: {
            ...defaults.quote,
            feeAmount: '0',
            buyAmount: (sellAmount * RATE).toString(),
          },
        }
      })

      // Matches the quote's implied rate so the trade doesn't look like a loss against the
      // fixture's flat $1-per-token USD prices, which would otherwise trip the "Confirm Price
      // Impact" dialog — same technique as [CS-64].
      mocks.usdPrices.setPrice(WETH, Number(RATE))

      await setupTestConditions({
        chainId: CHAIN_ID,
        tradeType: 'swap',
        sellToken: 'WETH',
        buyToken: 'USDC',
        sellAmount: '10',
        balances: { WETH: '10', USDC: '0' },
        allowances: { WETH: '10' },
      })

      await swapPage.receiveAmountTooltipTrigger.hover()

      const tooltipBox = swapPage.page.getByText('Before costs', { exact: true }).locator('xpath=../..')
      await expect(tooltipBox).toBeVisible()

      const protocolFeeCell = tooltipBox
        .getByText('Protocol fee', { exact: true })
        .locator('xpath=following-sibling::*[1]')

      // The surplus/buy token (USDC), with a leading "-" — `FeeItem` renders a sell order's fee rows
      // with `typeString = '-'` and `feeAmount.currency` (the buy token for a sell order's protocol
      // fee, per `getQuoteAmountsAndCosts`), not the sell token being spent.
      await expect(protocolFeeCell).toContainText('-')
      const protocolFeeTitle = await protocolFeeCell.locator('[title]').getAttribute('title')
      expect(protocolFeeTitle).toMatch(/ USDC$/)

      const readRowAmount = (label: string): Promise<bigint> =>
        readTitledAmount(tooltipBox.getByText(label, { exact: true }).locator('xpath=following-sibling::*[1]'))

      // See [CS-128]'s comment on the identical read: four separately-awaited reads risk a
      // re-render (the form's own default-amount probe quote settling into the typed one) landing
      // in between two of them, tearing the snapshot and skewing the ratio. Re-reading all four
      // together on every poll attempt rides out that race.
      let beforeCosts = 0n
      let protocolFee = 0n
      let networkCosts = 0n
      let toAmount = 0n

      await expect
        .poll(async () => {
          beforeCosts = await readRowAmount('Before costs')
          protocolFee = await readRowAmount('Protocol fee')
          networkCosts = await readRowAmount('Network costs')
          toAmount = await readRowAmount('To')
          return Number(protocolFee) / Number(beforeCosts)
        })
        .toBeCloseTo(0.0002, 6)

      expect(protocolFee).toBeGreaterThan(0n)
      expect(networkCosts).toBe(0n)

      // The core relationship: To = Before costs − Network costs − Protocol fee.
      expect(toAmount).toBe(beforeCosts - networkCosts - protocolFee)
    })

    test('[CS-128] Swap form: protocol fee applied at 0.003% (0.3 bps) for correlated assets (stables/RWAs) @smoke', async ({
      setupTestConditions,
      swapPage,
      wallet,
      mocks,
    }) => {
      const STANDARD_TIER_RATIO = 0.0002 // The non-correlated 2 bps tier from [CS-127], for the ~6.67× comparison below.

      // Same mechanism as [CS-127] (`protocolFeeBps` is a top-level quote field, applied identically
      // regardless of which tokens are picked — correlation-based tier selection is a backend/solver
      // decision this frontend just renders), just a different bps value and, for the USDC→USDT leg
      // below, a buy side with real 6 decimals instead of 18.
      function mockCorrelatedQuote(sellDecimals: number, buyDecimals: number): void {
        mocks.cowApi.set('quote', (req) => {
          const defaults = req.defaults as { quote: Record<string, unknown> }
          const sellAmount = BigInt(defaults.quote.sellAmount as string)
          const decimalsDelta = sellDecimals - buyDecimals
          const buyAmount =
            decimalsDelta === 0
              ? sellAmount
              : decimalsDelta > 0
                ? sellAmount / 10n ** BigInt(decimalsDelta)
                : sellAmount * 10n ** BigInt(-decimalsDelta)
          return {
            ...defaults,
            protocolFeeBps: '0.3',
            quote: { ...defaults.quote, feeAmount: '0', buyAmount: buyAmount.toString() },
          }
        })
      }

      async function checkProtocolFeeTier(opts: {
        sellSymbol: string
        buySymbol: string
        sellAddress: string
        buyAddress: string
        sellDecimals: number
        buyDecimals: number
      }): Promise<void> {
        const { sellSymbol, buySymbol, sellAddress, buyAddress, sellDecimals, buyDecimals } = opts

        mockCorrelatedQuote(sellDecimals, buyDecimals)

        // `setupTestConditions`'s own `balances`/`allowances` option resolves decimals via
        // `support/tokens.ts`, which already reports 18 decimals correctly for this deployment's
        // USDC (see known quirks) — seeded directly by address/decimals here instead, same pattern
        // as [CS-59]'s `seedTrader` use.
        seedTrader(mocks, wallet, CHAIN_ID, {
          balances: { [sellAddress]: parseUnits('1000', sellDecimals), [buyAddress]: 0n },
          allowances: { [sellAddress]: parseUnits('1000', sellDecimals) },
        })

        await setupTestConditions({
          chainId: CHAIN_ID,
          tradeType: 'swap',
          sellToken: sellSymbol,
          buyToken: buySymbol,
          sellAmount: '1000',
        })

        await swapPage.receiveAmountTooltipTrigger.hover()

        const tooltipBox = swapPage.page.getByText('Before costs', { exact: true }).locator('xpath=../..')
        await expect(tooltipBox).toBeVisible()

        const protocolFeeCell = tooltipBox
          .getByText('Protocol fee', { exact: true })
          .locator('xpath=following-sibling::*[1]')

        // The surplus/buy token, with a leading "-" — same rendering as [CS-127].
        await expect(protocolFeeCell).toContainText('-')
        const protocolFeeTitle = await protocolFeeCell.locator('[title]').getAttribute('title')
        expect(protocolFeeTitle).toMatch(new RegExp(` ${buySymbol}$`))

        const readRowAmount = (label: string): Promise<bigint> =>
          readTitledAmount(
            tooltipBox.getByText(label, { exact: true }).locator('xpath=following-sibling::*[1]'),
            buyDecimals,
          )

        // The tooltip briefly shows a stale quote (the form's own default-amount probe, fetched
        // before the typed "1000" settles) — `waitForQuote()` only waits for the loading flag to
        // clear once, not for these four rows to all reflect the *same* render. Reading them as
        // four separately-awaited calls risks a re-render landing in between two of them, tearing
        // the snapshot (e.g. `beforeCosts` from the stale quote, `protocolFee` from the fresh one)
        // and skewing the ratio below by orders of magnitude. Re-reading all four together on every
        // poll attempt, instead of trusting a single one-shot batch, rides out that race the same
        // way the recipient-checkbox retry in `[CC-17]` rides out its own settling-debounce race.
        let beforeCosts = 0n
        let protocolFee = 0n
        let networkCosts = 0n
        let toAmount = 0n

        await expect
          .poll(async () => {
            beforeCosts = await readRowAmount('Before costs')
            protocolFee = await readRowAmount('Protocol fee')
            networkCosts = await readRowAmount('Network costs')
            toAmount = await readRowAmount('To')
            return Number(protocolFee) / Number(beforeCosts)
          })
          .toBeCloseTo(0.00003, 6)

        expect(protocolFee).toBeGreaterThan(0n)
        expect(networkCosts).toBe(0n)

        // Protocol fee ≈ Before costs × 0.00003 (0.3 bps) — ~6.67× smaller than [CS-127]'s 2 bps tier
        // on equivalent volume.
        const ratio = Number(protocolFee) / Number(beforeCosts)
        expect(STANDARD_TIER_RATIO / ratio).toBeCloseTo(6.667, 1)

        // The core relationship: To = Before costs − Network costs − Protocol fee.
        expect(toAmount).toBe(beforeCosts - networkCosts - protocolFee)
      }

      await checkProtocolFeeTier({
        sellSymbol: 'USDC',
        buySymbol: 'USDT',
        sellAddress: USDC,
        buyAddress: USDT,
        sellDecimals: 18,
        buyDecimals: 6,
      })

      await checkProtocolFeeTier({
        sellSymbol: 'DAI',
        buySymbol: 'USDC',
        sellAddress: DAI,
        buyAddress: USDC,
        sellDecimals: 18,
        buyDecimals: 18,
      })
    })

    test('Shows "Price impact unknown" warning when USD prices are unavailable', async ({
      setupTestConditions,
      swapPage,
      mocks,
    }) => {
      // Break all three USD price sources `UsdPricesUpdater` tries (BFF, Defillama, and the CoW
      // Protocol native price fallback) for both legs of the trade, so neither can resolve a fiat
      // value and the price impact is left unknown rather than computed.
      mocks.usdPrices.setUnknown(WETH)
      mocks.usdPrices.setUnknown(USDC)
      mocks.cowApi.set('nativePrice', () => reply(404, { errorType: 'NotFound', description: 'token not found' }))

      await setupTestConditions({
        chainId: CHAIN_ID,
        tradeType: 'swap',
        sellToken: 'WETH',
        buyToken: 'USDC',
        sellAmount: '0.5',
        balances: { WETH: '1', USDC: '0' },
        allowances: { WETH: '10' },
      })

      await expect(swapPage.page.getByText('Price impact unknown - trade carefully')).toBeVisible()
    })

    test('[CS-129] Enable Hooks via settings toggle', async ({ swapPage }) => {
      await swapPage.goto({ chainId: CHAIN_ID })

      // `SettingsBox`/`Toggle` render the real `<input type="checkbox">` inert (0×0,
      // `pointer-events: none`) and rely on the enclosing `<label>` (`SettingsBoxWrapper`) to forward
      // clicks to it — the actual click target is the wrapper span (`#toggle-hooks-mode-button`
      // itself), not the checkbox.
      const hooksToggle = swapPage.page.locator('#toggle-hooks-mode-button')
      const hooksCheckbox = hooksToggle.locator('input[type="checkbox"]')

      // Enabling Hooks adds a new top-level nav item (`useMenuItems`'s `HOOKS_STORE_MENU_ITEM`)
      // alongside Swap/Limit/TWAP, routing to a `/swap/hooks` URL — there's no tab *inside* the swap
      // widget itself. At this viewport `TradeWidgetForm`'s `showDropdown` is true (a connected
      // wallet renders the "My orders" button, one of its triggers), so these nav items only exist in
      // the DOM behind the collapsed "Trading mode" dropdown, not as a plain visible link row.
      const tradingModeDropdown = swapPage.page.locator('[class*="styled__DropdownButton"]')
      const hooksLink = swapPage.page.locator('a[href*="/swap/hooks"]')

      // Precondition: Hooks starts disabled, so its nav entry isn't rendered yet.
      await tradingModeDropdown.click()
      await expect(hooksLink).toBeHidden()

      // A full reload (not another `goto`, which only changes the hash on this single-page app and
      // wouldn't remount anything) is the simplest way to close the dropdown before opening settings —
      // the dropdown's own overlay covers the header, including the settings gear icon, while open.
      await swapPage.page.reload()

      await swapPage.page.locator('#open-settings-dialog-button').click()
      await expect(hooksCheckbox).not.toBeChecked()

      await hooksToggle.click()
      await expect(hooksCheckbox).toBeChecked()
      await swapPage.page.keyboard.press('Escape')

      await tradingModeDropdown.click()
      await expect(hooksLink).toBeVisible()

      // Setting persists across a refresh — it's backed by `state.user.hooksEnabled`, written to
      // `localStorage` by `redux-localstorage-simple` with a 1s debounce (`legacy/state/index.ts`).
      // Reloading before that debounce fires would reload the pre-toggle value, so wait for the
      // write to actually land first instead of guessing a timeout.
      await expect
        .poll(() => swapPage.page.evaluate(() => localStorage.getItem('redux_localstorage_simple_user')))
        .toContain('"hooksEnabled":true')

      await swapPage.page.reload()

      await swapPage.page.locator('#open-settings-dialog-button').click()
      await expect(hooksCheckbox).toBeChecked()
      await swapPage.page.keyboard.press('Escape')

      await tradingModeDropdown.click()
      await expect(hooksLink).toBeVisible()
      await hooksLink.click()

      await expect(swapPage.page).toHaveURL(/\/swap\/hooks(\/|$|\?)/)
      // The Hooks tab is the same swap widget, with these hook-management buttons added around the
      // form — there's no separate "browse hooks" landing screen at this route.
      await expect(swapPage.page.getByText('Add Pre-Hook Action')).toBeVisible()
      await expect(swapPage.page.getByText('Add Post-Hook Action')).toBeVisible()
    })

    test('[CS-136] Hooks: cross-chain swaps are not available', async ({ swapPage, mocks, context }) => {
      // Resolving WXDAI@Gnosis as a currency needs both of these — the general per-chain token
      // list (same endpoint `installTokenLists` already stubs for every chain) and the bridge
      // provider's own "is this a valid destination token" check, which otherwise hits a real,
      // unmocked `bff.barn.cow.fi` endpoint (confirmed by tracing actual network requests — see
      // `mockBridgeSupportedTokens`'s own doc comment). No live Gnosis RPC call is involved either
      // way, since the test never submits a trade, only inspects picker/URL/nav state.
      mocks.tokenLists.setListForChain(GNOSIS_CHAIN_ID, {
        tokens: [{ address: WXDAI, symbol: 'WXDAI', name: 'Wrapped XDAI', decimals: 18, chainId: GNOSIS_CHAIN_ID }],
      })
      mockBridgeSupportedTokens(context, [
        { address: WXDAI, symbol: 'WXDAI', name: 'Wrapped XDAI', decimals: 18, chainId: GNOSIS_CHAIN_ID },
      ])
      // The default quote fixture's WETH/USDC rate is a real recorded snapshot (~546.99 USDC per
      // WETH), not an arbitrary placeholder — leave it as-is rather than overriding it with an
      // artificial rate. `mocks.usdPrices` defaults every token to $1 though, which doesn't match
      // that real ratio and renders an absurd price-impact percentage; match it here instead.
      mocks.usdPrices.setPrice(WETH, 546.9898499813039)

      // Part 1: the buy-token picker on the Hooks tab never offers another chain to pick from.
      await swapPage.page.goto(`/#/${CHAIN_ID}/swap/hooks/${WETH}/${USDC}`)
      await swapPage.unlockIfNeeded()
      await expect(swapPage.page.getByText('Add Pre-Hook Action')).toBeVisible()

      await swapPage.tokens.openInput()
      await swapPage.tokens.searchAndPick('WETH')
      await expect(swapPage.sellTokenSelect).toHaveAttribute('aria-label', 'Selected token: WETH')

      await swapPage.tokens.openOutput()
      // `useChainPanelState`'s chain-tab (`ChainButton` rows, e.g. "Gnosis") only renders when
      // `isBridgingEnabled` is true, which `BridgingEnabledUpdater` hardcodes to false off the
      // Swap route — so there's no chain row to pick from at all on Hooks, scoped to the picker
      // itself since the header's own network switcher also renders a "Gnosis" label elsewhere.
      await expect(swapPage.tokens.currencyList.getByText('Gnosis', { exact: true })).not.toBeVisible()
      await swapPage.page.keyboard.press('Escape')
      await swapPage.tokens.currencyList.waitFor({ state: 'hidden' })

      // Part 2: a cross-chain buy token set on Swap is reset when navigating to Hooks via the
      // in-app tab link (`useGetTradeUrlParams` — the one path this ticket's reset IS wired up on).
      await swapPage.page.goto(`/#/${CHAIN_ID}/swap/${WETH}/${WXDAI}?targetChainId=${GNOSIS_CHAIN_ID}`)
      await swapPage.unlockIfNeeded()
      await expect(swapPage.buyTokenSelect).toHaveAttribute('aria-label', 'Selected token: WXDAI')

      // Make this a genuinely active bridge trade (amount entered, quote loaded), not just tokens
      // picked with an empty form — the reset-on-navigate behavior below should hold for a real,
      // in-flight bridge quote, not merely for two currency IDs sitting unused in the URL.
      await swapPage.enterSellAmount('1')
      await swapPage.waitForQuote()

      // The Hooks nav link only renders once `state.user.hooksEnabled` is set (same
      // `redux-localstorage-simple`-backed flag [CS-129] toggles via Settings) — set it directly
      // rather than re-exercising that toggle flow, and reload so the store rehydrates with it.
      await swapPage.page.evaluate(() =>
        localStorage.setItem('redux_localstorage_simple_user', JSON.stringify({ hooksEnabled: true })),
      )
      await swapPage.page.reload()
      await swapPage.unlockIfNeeded()
      await expect(swapPage.buyTokenSelect).toHaveAttribute('aria-label', 'Selected token: WXDAI')

      // Same viewport quirk as [CS-129]: the trade-mode tabs are collapsed behind this dropdown.
      const tradingModeDropdown = swapPage.page.locator('[class*="styled__DropdownButton"]')
      const hooksLink = swapPage.page.locator('a[href*="/swap/hooks"]')
      await tradingModeDropdown.click()
      await hooksLink.click()

      await expect(swapPage.page).toHaveURL(/\/swap\/hooks(\/|$|\?)/)
      await expect(swapPage.page).not.toHaveURL(/targetChainId=/)
      // The whole trade form resets to the Sepolia Hooks-tab default pair (WETH/USDC) — not just
      // the buy side — per `getDefaultTradeRawState`: `useGetTradeUrlParams` keeps `inputCurrencyId`
      // as-is when leaving a bridging Swap (already WETH here, so unchanged) and falls back
      // `outputCurrencyId` to the target widget's default (USDC), dropping `targetChainId` entirely.
      await expect(swapPage.sellTokenSelect).toHaveAttribute('aria-label', 'Selected token: WETH')
      await expect(swapPage.buyTokenSelect).toHaveAttribute('aria-label', 'Selected token: USDC')
      // The sell amount typed on the Swap tab carries over as-is (only the currencies reset) — no
      // need to re-enter it here.
      await expect(swapPage.inputAmount).toHaveValue('1')

      // The reset pair is same-chain (Sepolia/Sepolia), so this is an ordinary quote, not a bridge
      // one — no "No routes found" (that's a bridge-route error) should linger from the pre-reset
      // cross-chain state, and the carried-over sell amount should have a fresh, non-bridge quote
      // automatically recalculated for it against the reset pair.
      await expect(swapPage.page.getByText('No routes found')).not.toBeVisible()
      await swapPage.waitForQuote()
      // The realistic recorded rate (~546.99 USDC/WETH) from the default quote fixture, scaled to
      // the carried-over 1 WETH sell amount — and, since `mocks.usdPrices` above now matches that
      // same rate, a sane price impact rather than the fixture/$1-default mismatch's absurd one.
      await expect(swapPage.outputAmount).toHaveValue('547.1548')
      await expect(swapPage.priceImpact).toContainText('0.03%')

      // The reset form isn't just quoted, it's genuinely actionable — the approve/swap button
      // (WETH allowance is unset for this wallet, same describe-block default as every other test
      // here, so the partial/full approval selector renders too) actually becomes enabled, proving
      // this isn't a partially-broken post-reset state that merely looks quoted.
      await expect(swapPage.approveModeSelector).toBeVisible()
      await expect(swapPage.primaryActionButton).toBeEnabled()
    })

    test('[CS-131] Add a Pre-hook to a swap order', async ({
      swapPage,
      tradePage,
      wallet,
      confirmModal,
      accountModal,
      mocks,
      context,
    }) => {
      // The real CoW Protocol GPv2VaultRelayer address (same across chains) — used only as the
      // `approve()` spender encoded into the hook's calldata below, to represent a realistic
      // "token approval" pre-hook per the ticket's example, not because it's ever actually called
      // (the hook is never executed on a real chain in this mocked test).
      const VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'
      const HOOK_GAS_LIMIT = '45000'
      const approveCalldata = encodeFunctionData({
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'approve',
        args: [VAULT_RELAYER, parseUnits('1', 18)],
      })

      // Realistic quote: the default fixture's real recorded WETH/USDC rate (~546.99, see [CS-136]
      // for how this was confirmed), not an artificial 1:1 — matching `usdPrices` to it avoids the
      // otherwise-absurd price-impact percentage that mismatch produces.
      mocks.usdPrices.setPrice(WETH, 546.9898499813039)
      mocks.allowances.set(wallet.address, CHAIN_ID, { [WETH]: parseUnits('10', 18) })
      // None of these real endpoints was mocked before this test — see each helper's own doc
      // comment for what they replace and why (a 403'ing token-logo CDN, the hook's unmocked
      // GitHub-hosted logo, and a live Tenderly simulation call the confirmation screen makes
      // once a hook is attached).
      mockTokenLogos(context)
      mockHookLogo(context)
      mockHooksSimulation(context)

      // Enable Hooks via the Settings toggle first (same mechanic [CS-129] exercises in full),
      // then navigate to the Hooks tab through the UI — not a direct URL shortcut.
      await swapPage.goto({ chainId: CHAIN_ID })
      await swapPage.page.locator('#open-settings-dialog-button').click()
      await swapPage.page.locator('#toggle-hooks-mode-button').click()
      await swapPage.page.keyboard.press('Escape')

      // Same viewport quirk as [CS-129]: the trade-mode tabs are collapsed behind this dropdown.
      const tradingModeDropdown = swapPage.page.locator('[class*="styled__DropdownButton"]')
      const hooksLink = swapPage.page.locator('a[href*="/swap/hooks"]')
      await tradingModeDropdown.click()
      await hooksLink.click()
      await expect(swapPage.page).toHaveURL(/\/swap\/hooks(\/|$|\?)/)
      await expect(swapPage.page.getByText('Add Pre-Hook Action')).toBeVisible()

      await swapPage.enterSellAmount('1')
      await swapPage.waitForQuote()

      // Opens `HookRegistryList` — a searchable Hook Store modal listing both built-in ("Build your
      // own hook", `BUILD_CUSTOM_HOOK` in `hookRegistry.tsx`) and custom hook dapps.
      await swapPage.page.getByText('Add Pre-Hook Action', { exact: true }).click()
      await swapPage.page.getByPlaceholder('Search hooks by title or description').fill('Build your own hook')
      // `HookListItem` renders the whole `<li>` card clickable to *open its details page*
      // (`onOpenDetails`) — only the "Open" button inside it actually selects the dapp
      // (`onSelect`) and opens `BuildHookApp`'s form.
      const hookCard = swapPage.page.locator('li', { hasText: 'Build your own hook' })
      await hookCard.getByRole('button', { name: 'Open', exact: true }).click()

      // `BuildHookApp`'s plain form: `<input name="target">`, `<input name="gasLimit">`,
      // `<textarea name="callData">` — no ids/`data-testid`, matched by their `name` attribute.
      await swapPage.page.locator('input[name="target"]').fill(WETH)
      await swapPage.page.locator('input[name="gasLimit"]').fill(HOOK_GAS_LIMIT)
      await swapPage.page.locator('textarea[name="callData"]').fill(approveCalldata)
      await swapPage.page.getByRole('button', { name: 'Add Pre-hook', exact: true }).click()

      // The Hook Store modal closes back to the swap form once `context.addHook` resolves.
      await swapPage.page.getByPlaceholder('Search hooks by title or description').waitFor({ state: 'hidden' })
      await expect(swapPage.page.getByText('Build your own hook', { exact: true })).toBeVisible()

      const posting = tradePage.mockOrderPosting(mocks.cowApi, wallet.address)
      await swapPage.clickSwap()

      // `TradeConfirmation` renders `OrderHooksDetails` with `isTradeConfirmation`, which is what
      // triggers the Tenderly simulation fetch — expand the "Hooks" summary, then the individual
      // hook row, to reach the "Simulation successful" text `HookItem` renders off a `status: true`
      // response (mocked above), plus its dapp logo actually loading (not a broken/letter fallback).
      const confirmationModal = swapPage.page.locator('#trade-confirmation')
      // `HookTag` renders "PRE" and its count (`<b>1</b>`) as one element's text ("PRE 1"), so an
      // exact match on "PRE" alone doesn't match — substring instead.
      await confirmationModal.getByText('PRE').click()
      const hookRow = confirmationModal.getByText('Build your own hook', { exact: true })
      await expect(hookRow).toBeVisible()
      // This particular logo (`hookDappsRegistry.ts`'s `BUILD_CUSTOM_HOOK.image`) is mocked via
      // `mockHookLogo` above, but the `<img>` load is still async, so poll instead of a single
      // immediate read.
      const hookLogo = confirmationModal.locator('img[alt="Build your own hook"]')
      await expect(hookLogo).toBeVisible()
      await expect
        .poll(() => hookLogo.evaluate((img: HTMLImageElement) => img.naturalWidth), { timeout: 15_000 })
        .toBeGreaterThan(0)
      await hookRow.click()
      await expect(confirmationModal.getByText('Simulation successful', { exact: true })).toBeVisible()

      await confirmModal.confirm()

      await expect(swapPage.orderProgressBarModal).toContainText('Batching orders')
      posting.fulfill(mocks.balances, CHAIN_ID, parseUnits('10', 18), parseUnits('1500', 18))
      await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!', { timeout: 15_000 })
      await swapPage.page.keyboard.press('Escape')

      // `mockOrderPosting`'s `buildOpenOrder` already echoes the posted `appData` back as
      // `fullAppData` on the mocked `accountOrders`/`order` endpoints — `OrderHooksDetails`
      // (`common/containers/OrderHooksDetails`) decodes that same field to render this "Hooks"
      // summary in `ActivityDetails`, so this is a genuine round-trip check: the hook was correctly
      // built into the signed order's appData, not just added to local form state.
      await accountModal.open()
      await expect(accountModal.activitiesList).toContainText('Hooks')
      await expect(accountModal.activitiesList).toContainText('PRE')
    })
  })

  test.describe('Disconnected wallet', () => {
    // The shared `wallet` fixture is `auto: true` (always instantiated so the injected provider
    // exists before the page loads), but with auto-connect seeding off it never reconnects the
    // app on boot — `wallet.connectViaModal()` is there for specs that need to connect later,
    // simply never calling it is what keeps this test's app state disconnected throughout.
    test.use({ mockWalletAutoConnect: false })

    test('[CS-102] Not connected state: Connect Wallet button shown @smoke', async ({ swapPage }) => {
      await swapPage.goto({ chainId: CHAIN_ID })

      // This validation state's button (`TradeFormBlankButton`) doesn't carry the `#do-trade-button`
      // id the other validation states render under, and the header has its own, differently-cased
      // "Connect wallet" button — `swapPage.connectWalletButton` matches `exact` to land on the swap
      // form's "Connect Wallet" specifically (confirmed via a DOM dump: two buttons, only this one
      // capitalizes "Wallet").
      await expect(swapPage.connectWalletButton).toBeVisible()
    })
  })
})
