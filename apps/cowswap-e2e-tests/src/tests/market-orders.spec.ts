import type { Hex } from 'viem'

import { test, expect } from '../fixtures'
import { reply } from '../mocks/cowProtocolApi'
import { CHAIN_IDS } from '../support/constants'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
const CHAIN_ID = CHAIN_IDS.SEPOLIA

const DEFAULT_WETH_BALANCE = 1_000_000_000_000_000_000n // 1 WETH

test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

test.describe('Market Orders', () => {
  test('[MO-01] Sell order: WETH → USDC @smoke', async ({ setupTestConditions, swapPage, confirmModal }) => {
    await setupTestConditions({
      chainId: CHAIN_ID,
      tradeType: 'swap',
      sellToken: 'WETH',
      buyToken: 'USDC',
      sellAmount: '0.5',
      balances: { WETH: '1', USDC: '0' },
      allowances: { WETH: '10' },
    })
    await expect(swapPage.outputAmount).not.toHaveValue('')
    await swapPage.clickSwap()
    await expect(confirmModal.confirmButton).toContainText(/confirm swap/i)
  })

  test('[MO-02] Sufficient allowance: proceeds straight to confirm swap', async ({
    setupTestConditions,
    swapPage,
    confirmModal,
  }) => {
    await setupTestConditions({
      chainId: CHAIN_ID,
      tradeType: 'swap',
      sellToken: 'WETH',
      buyToken: 'USDC',
      sellAmount: '0.5',
      balances: { WETH: '1', USDC: '0' },
      allowances: { WETH: '10' },
    })
    await expect(swapPage.outputAmount).not.toHaveValue('')

    await expect(swapPage.swapButton).not.toContainText(/approve/i)
    await swapPage.clickSwap()
    await expect(confirmModal.confirmButton).toContainText(/confirm swap/i)
  })

  test('[MO-03] Insufficient allowance: asks for approval', async ({ setupTestConditions, swapPage }) => {
    await setupTestConditions({
      chainId: CHAIN_ID,
      tradeType: 'swap',
      sellToken: 'WETH',
      buyToken: 'USDC',
      sellAmount: '0.5',
      balances: { WETH: '1', USDC: '0' },
      allowances: { WETH: '0' },
    })

    await expect(swapPage.approveButton).toContainText(/approve/i)
  })

  test('[MO-04] Sell order: balances update in the UI after the order is posted', async ({
    setupTestConditions,
    swapPage,
    wallet,
    confirmModal,
    mocks,
  }) => {
    const PRICE_FACTOR = 12_000n // buy-token units per 1 sell-token unit — arbitrary, just needs to stay proportional

    // Pin buyAmount proportional to whatever sellAmount was actually requested, not a fixed
    // absolute value, so the assertions below stay round numbers. Fee and protocolFeeBps are
    // zeroed: the former so the posted order's sellAmount (quote sellAmount + fee) matches the
    // typed amount exactly, the latter because the fixture's "0.3" otherwise gets layered on top
    // of the displayed buy amount — both would otherwise turn the balance assertions after the
    // trade into non-round numbers.
    mocks.cowApi.set('quote', (req) => {
      const defaults = req.defaults as { quote: Record<string, unknown> }
      const sellAmount = BigInt(defaults.quote.sellAmount as string)
      return {
        ...defaults,
        protocolFeeBps: '0',
        quote: { ...defaults.quote, buyAmount: (sellAmount * PRICE_FACTOR).toString(), feeAmount: '0' },
      }
    })

    // The orderbook is fully mocked already (the shared `mocks` fixture blocks and fails the
    // test on any un-mocked CoW API URL) — this additionally keeps the rest of the mock stack
    // in sync with what posting the order actually did, exactly as the real backend would once
    // the trade settles on-chain.
    const fulfillment = swapPage.mockSwapFulfillment(
      mocks.cowApi,
      mocks.balances,
      wallet.address,
      CHAIN_ID,
      DEFAULT_WETH_BALANCE,
    )

    await setupTestConditions({
      chainId: CHAIN_ID,
      tradeType: 'swap',
      sellToken: 'WETH',
      buyToken: 'USDC',
      sellAmount: '0.5',
      balances: { WETH: '1', USDC: '0' },
      allowances: { WETH: '10' },
    })

    const sellAmount = 500_000_000_000_000_000n // 0.5 WETH
    await expect(swapPage.outputAmount).toHaveValue(String((sellAmount * PRICE_FACTOR) / 10n ** 18n))

    await expect(swapPage.sellBalance).toHaveAttribute('title', '1 WETH')
    await expect(swapPage.buyBalance).toHaveAttribute('title', '0 USDC')

    await swapPage.clickSwap()
    await confirmModal.confirmButton.click()

    // The currency panels hide their balance while a trade is pending/just-submitted
    // (`CurrencyInputPanel` only renders it when `!disabled`). Posting the order opens the
    // order-progress screen; `orderStatus` reporting "traded" (mocked above) is what moves it
    // to a completed state, whose back arrow has no accessible name but dismisses on Escape,
    // returning to the normal, interactive swap form.
    await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!')
    await swapPage.page.keyboard.press('Escape')

    // Waits out the balances-watcher SSE reconnect that picks up `mockSwapFulfillment`'s
    // update above — Playwright's `expect` polls until this passes.
    await expect(swapPage.sellBalance).toHaveAttribute('title', '0.5 WETH', { timeout: 15_000 })
    // The order's buyAmount is the quote's buyAmount minus the app's own slippage — assert
    // against what was actually posted rather than re-deriving that math.
    await expect(swapPage.buyBalance).toHaveAttribute(
      'title',
      `${BigInt(fulfillment.getPostedBuyAmount()) / 10n ** 18n} USDC`,
      { timeout: 15_000 },
    )
  })

  test('[MO-05] Shows "Price impact unknown" warning when USD prices are unavailable', async ({
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
})
