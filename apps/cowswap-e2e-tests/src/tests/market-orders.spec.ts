import { formatUnits, parseUnits, type Hex } from 'viem'

import { test, expect } from '../fixtures'
import { generateOrderId } from '../mocks/orders'
import { CHAIN_IDS } from '../support/constants'
import { expectActivityStatus } from '../support/expectActivityStatus'
import { mockFixedRateQuote } from '../support/mockFixedRateQuote'
import { readTitledAmount } from '../support/readTitledAmount'
import { seedTrader } from '../support/seedTrader'
import { selectTokens } from '../support/selectTokens'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
const CHAIN_ID = CHAIN_IDS.SEPOLIA

test.describe('Market Orders', () => {
  test.describe('Connected EOA wallet', () => {
    test.use({
      mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined,
    })

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

      const orderId = generateOrderId()

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

      await mocks.orders.expectOrderToBePosted({
        orderId,
        owner: wallet.address,
        trigger: async () => {
          await swapPage.clickSwap()
          await confirmModal.confirm()
        },
      })

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
      mocks.orders.markExecuting(orderId)
      await expect(swapPage.orderProgressBarModal).toContainText('Best price found!', { timeout: 15_000 })

      await expectActivityStatus(accountModal, 'Open')

      // Settle the order now that it's posted and confirmed.
      mocks.orders.fulfillOrder(orderId, mocks.balances, CHAIN_ID, INITIAL_USDC_BALANCE, 0n)

      // Step 4 (FINISHED, backend TRADED) — trade settled.
      await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!', { timeout: 15_000 })

      // `FinishedStep`'s "You sold"/"Received" rows render the order's actual executed amounts
      // (`order.apiAdditionalInfo.executedSellAmount`/`executedBuyAmount`), not the originally
      // quoted ones — cross-check them against what `fulfill()` actually settled the order at.
      const soldAmountRow = swapPage.orderProgressBarModal.locator('span', { hasText: 'You sold' }).first()
      const receivedAmountRow = swapPage.orderProgressBarModal.locator('span', { hasText: 'Received' }).first()
      const postedOrder = mocks.orders.getOrder(orderId)
      expect(await readTitledAmount(soldAmountRow)).toBe(BigInt(postedOrder?.sellAmount ?? 0))
      expect(await readTitledAmount(receivedAmountRow)).toBe(BigInt(postedOrder?.buyAmount ?? 0))

      await swapPage.page.keyboard.press('Escape')

      await expect(swapPage.sellBalance).toHaveAttribute('title', '500 USDC', { timeout: 15_000 })
      await expect(swapPage.buyBalance).toHaveAttribute(
        'title',
        `${formatUnits(BigInt(mocks.orders.getOrder(orderId)?.buyAmount ?? 0), 18)} WETH`,
        { timeout: 15_000 },
      )

      await expectActivityStatus(accountModal, 'Filled')
    })
  })
})
