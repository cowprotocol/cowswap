import { parseUnits, type Hex } from 'viem'

import { test, expect } from '../fixtures'
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
    tradePage,
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

    // Page-agnostic (only wires CoW API mocks). The real trade flow tags the pending order
    // `class: LIMIT` locally before dispatch, and that local class always wins over a fetched
    // order's — so this helper's hardcoded `class: 'market'` on the fabricated order doesn't
    // filter it out of the Limit tab.
    tradePage.mockOrderPosting(mocks.cowApi, wallet.address)

    await limitPage.goto({ chainId: CHAIN_ID, sell: USDC, buy: COW })
    await limitPage.enterSellAmount('120')
    await limitPage.waitForQuote()

    // USDC is a recognized Sepolia stablecoin, so once both amounts are quoted the app's smart
    // quote-selection auto-quotes this pair by the non-stable side: the rate field ends up asking
    // "When 1 COW is worth ? USDC" rather than "When 1 USDC is worth ? COW". 0.2 is the exact
    // reciprocal of 5, so it encodes the same "1 USDC = 5 COW" price regardless of orientation.
    await limitPage.setLimitPrice('0.2')

    await limitPage.placeOrder()
    await expect(confirmModal.confirmButton).toContainText('Place limit order')
    await confirmModal.confirm()

    // The mock wallet signs and `postOrder` responds instantly, so the flow skips past any
    // transient progress step straight to the confirm modal's "Order Submitted" screen.
    await expect(limitPage.orderSubmittedHeading).toBeVisible()
    await limitPage.continueButton.click()

    await limitPage.openOrdersTab.click()
    await expect(limitPage.ordersTable).toContainText('COW')
  })
})
