import { parseUnits, type Hex } from 'viem'

import { test, expect } from '../fixtures'
import { generateOrderId } from '../mocks/orders'
import { CHAIN_IDS } from '../support/constants'

const CHAIN_ID = CHAIN_IDS.SEPOLIA
const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const COW = '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59'

// Connected wallet is a viem account from INTEGRATION_TEST_PRIVATE_KEY (mock wallet, no MetaMask extension).
test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

test.describe('Limit Orders', () => {
  test('[LO-01] Place sell limit order: WETH → USDC @smoke', async ({
    setupTestConditions,
    limitPage,
    confirmModal,
  }) => {
    await setupTestConditions({
      chainId: CHAIN_ID,
      tradeType: 'limitOrder',
      sellToken: 'WETH',
      buyToken: 'USDC',
      sellAmount: '0.5',
      balances: { WETH: '1', USDC: '0' },
      allowances: { WETH: '10' },
    })
    await limitPage.setLimitPrice('2000')
    await limitPage.placeOrder()
    await expect(confirmModal.confirmButton).toContainText('Place limit order')
  })

  test('[LO-02] Place sell limit order: USDC → COW, order shows up in the orders table', async ({
    limitPage,
    wallet,
    confirmModal,
    mocks,
  }) => {
    // Both Sepolia test tokens report 18 decimals on-chain (verified via `decimals()`), not
    // USDC's real-world 6 — `support/tokens.ts` disagrees and doesn't register COW at all — so
    // balances/allowances are set directly here (mirrors [MO-06]) instead of going through
    // `setupTestConditions`.
    const SELL_AMOUNT = parseUnits('120', 18)
    // The posted order's sellAmount includes the fee on top of the typed 120, so an allowance of
    // exactly `SELL_AMOUNT` flags the order "Unfillable" in the table — give it headroom.
    const ALLOWANCE = parseUnits('1000', 18)
    mocks.balances.set(wallet.address, CHAIN_ID, { [USDC]: SELL_AMOUNT, [COW]: 0n })
    mocks.allowances.set(wallet.address, CHAIN_ID, { [USDC]: ALLOWANCE })

    // Limit orders derive their "market rate" from `usdPrices`, not from the quote (see
    // `QuoteObserverUpdater`'s `useSpotPrice`). `usdPrices` defaults every token to $1, which would
    // price this pair at 1 USDC = 1 COW market rate — five times the limit price set below (1 USDC =
    // 0.2 COW) — and trips the confirm screen's "limit price is 80% lower than market" warning
    // banner. Pricing COW at $5 makes 1 USDC = 0.2 COW the fair market rate, matching the limit price.
    mocks.usdPrices.setPrice(COW, 5)

    const orderId = generateOrderId()

    await limitPage.goto({ chainId: CHAIN_ID, sell: USDC, buy: COW })
    await limitPage.enterSellAmount('120')
    await limitPage.waitForQuote()

    // Typed while the field is still in its default (non-inverted) orientation — "1 USDC = ? COW" —
    // so this sets the limit price to 1 USDC = 0.2 COW. Once the quote lands, USDC being a
    // recognized Sepolia stablecoin makes the app's smart quote-selection auto-invert display to the
    // non-stable side ("1 COW = 5 USDC" on screen), but that only re-displays this same stored rate.
    await limitPage.setLimitPrice('0.2')

    await limitPage.placeOrder()
    await expect(confirmModal.confirmButton).toContainText('Place limit order')

    // Real trade flow tags the pending order `class: LIMIT` locally before dispatch, and that
    // local class always wins over a fetched order's — so `expectOrderToBePosted`'s hardcoded
    // `class: 'market'` on the fabricated order doesn't filter it out of the Limit tab.
    await mocks.orders.expectOrderToBePosted({
      orderId,
      owner: wallet.address,
      trigger: () => confirmModal.confirm(),
    })

    // The mock wallet signs and `postOrder` responds instantly, so the flow skips past any
    // transient progress step straight to the confirm modal's "Order Submitted" screen.
    await expect(limitPage.orderSubmittedHeading).toBeVisible()
    await limitPage.continueButton.click()

    await limitPage.openOrders()
    await expect(limitPage.ordersTable).toContainText('COW')
  })
})
