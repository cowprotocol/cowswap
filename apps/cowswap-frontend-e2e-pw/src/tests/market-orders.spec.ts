import type { Hex } from 'viem'

import { test, expect } from '../fixtures/mockWallet'
import { CHAIN_IDS } from '../support/constants'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

interface PostOrderBody {
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  receiver: string
  validTo: number
  appData: string
  appDataHash: string
  feeAmount: string
  kind: string
  partiallyFillable: boolean
  sellTokenBalance: string
  buyTokenBalance: string
  signingScheme: string
  signature: string
}

test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

test.describe('Market Orders', () => {
  test('[MO-01] Sell order: WETH → USDC @smoke', async ({ swapPage, confirmModal }) => {
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await swapPage.waitForQuote()
    await swapPage.enterSellAmount('0.5')
    await expect(swapPage.outputAmount).not.toHaveValue('')
    await swapPage.clickSwap()
    await expect(confirmModal.confirmButton).toContainText(/confirm swap/i)
  })

  test('[MO-02] Sufficient allowance: proceeds straight to confirm swap', async ({
    swapPage,
    wallet,
    confirmModal,
    mocks,
  }) => {
    mocks.allowances.set(wallet.address, CHAIN_IDS.SEPOLIA, { [WETH]: '10000000000000000000' })

    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await swapPage.waitForQuote()
    await swapPage.enterSellAmount('0.5')
    await expect(swapPage.outputAmount).not.toHaveValue('')

    await expect(swapPage.swapButton).not.toContainText(/approve/i)
    await swapPage.clickSwap()
    await expect(confirmModal.confirmButton).toContainText(/confirm swap/i)
  })

  test('[MO-03] Insufficient allowance: asks for approval', async ({ swapPage, wallet, mocks }) => {
    mocks.allowances.set(wallet.address, CHAIN_IDS.SEPOLIA, { [WETH]: '0' })

    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await swapPage.waitForQuote()
    await swapPage.enterSellAmount('0.5')

    await expect(swapPage.approveButton).toContainText(/approve/i)
  })

  test('[MO-04] Sell order: balances update in the UI after the order is posted', async ({
    swapPage,
    wallet,
    confirmModal,
    mocks,
  }) => {
    const chainId = CHAIN_IDS.SEPOLIA
    const SELL_BALANCE_BEFORE = 1_000_000_000_000_000_000n // 1 WETH
    const PRICE_FACTOR = 12_000n // buy-token units per 1 sell-token unit — arbitrary, just needs to stay proportional

    mocks.allowances.set(wallet.address, chainId, { [WETH]: '10000000000000000000' })
    mocks.balances.set(wallet.address, chainId, { [WETH]: SELL_BALANCE_BEFORE.toString(), [USDC]: '0' })

    // Pin buyAmount proportional to whatever sellAmount was actually requested, not a fixed
    // absolute value: the swap form defaults the sell input to the full wallet balance before
    // the test types its own amount, firing its own quote for that default amount first. A
    // fixed buyAmount would make that stale quote and the real one indistinguishable, hiding
    // the race below. Fee and protocolFeeBps are zeroed: the former so the posted order's
    // sellAmount (quote sellAmount + fee) matches the typed amount exactly, the latter because
    // the fixture's "0.3" otherwise gets layered on top of the displayed buy amount — both
    // would otherwise turn the balance assertions after the trade into non-round numbers.
    mocks.cowApi.set('quote', (req) => {
      const defaults = req.defaults as { quote: Record<string, unknown> }
      const sellAmount = BigInt(defaults.quote.sellAmount as string)
      return {
        ...defaults,
        protocolFeeBps: '0',
        quote: { ...defaults.quote, buyAmount: (sellAmount * PRICE_FACTOR).toString(), feeAmount: '0' },
      }
    })

    // `accountOrders` starts out as the plain fixture list; once the order below is posted,
    // this starts prepending it — fulfilled — so "My orders" reflects the trade emulated
    // as settled in the orderbook, without the app ever seeing a real fill on-chain.
    let postedOrder: Record<string, unknown> | null = null
    mocks.cowApi.set('accountOrders', (req) => {
      const defaults = req.defaults as unknown[]
      return postedOrder ? [postedOrder, ...defaults] : defaults
    })

    // The orderbook is fully mocked already (the shared `mocks` fixture blocks and fails
    // the test on any un-mocked CoW API URL) — this override additionally keeps the
    // balances mock in sync with what posting the order actually did, exactly as the
    // real balances-watcher would once the trade settles on-chain.
    let postedBuyAmount = ''
    mocks.cowApi.set('postOrder', (req) => {
      const body = req.body as PostOrderBody
      const uid = req.defaults as string
      const remainingSell = SELL_BALANCE_BEFORE - BigInt(body.sellAmount)
      postedBuyAmount = body.buyAmount
      mocks.balances.set(wallet.address, chainId, {
        [WETH]: remainingSell.toString(),
        [USDC]: body.buyAmount,
      })

      postedOrder = {
        creationDate: new Date().toISOString(),
        owner: wallet.address,
        uid,
        availableBalance: null,
        executedBuyAmount: body.buyAmount,
        executedSellAmount: body.sellAmount,
        executedSellAmountBeforeFees: body.sellAmount,
        executedFeeAmount: '0',
        executedFee: '123000000000',
        executedFeeToken: body.sellToken,
        invalidated: false,
        status: 'fulfilled',
        class: 'market',
        settlementContract: '0xf553d092b50bdcbdded1a99af2ca29fbe5e2cb13',
        isLiquidityOrder: false,
        fullAppData: body.appData,
        sellToken: body.sellToken,
        buyToken: body.buyToken,
        receiver: body.receiver,
        sellAmount: body.sellAmount,
        buyAmount: body.buyAmount,
        validTo: body.validTo,
        appData: body.appDataHash,
        feeAmount: body.feeAmount,
        kind: body.kind,
        partiallyFillable: body.partiallyFillable,
        sellTokenBalance: body.sellTokenBalance,
        buyTokenBalance: body.buyTokenBalance,
        signingScheme: body.signingScheme,
        signature: body.signature,
        interactions: { pre: [], post: [] },
      }

      // Order-progress polls this once the order exists — "traded" is what moves it past
      // "still searching" to a fulfilled state, mirroring the same fill emulated above.
      mocks.cowApi.set('orderStatus', () => ({
        type: 'traded',
        value: [
          {
            solver: '0x99b4136666ca1d13020830350ca8d01a0e5e466b',
            executedAmounts: { sell: body.sellAmount, buy: body.buyAmount },
          },
        ],
      }))

      return req.defaults
    })

    await swapPage.goto({ chainId, sell: WETH, buy: USDC })
    await swapPage.waitForQuote()
    // The swap form defaults the sell input to the full wallet balance (1 WETH), firing its
    // own quote for a not-quite-round amount (a pre-existing app quirk unrelated to this
    // test). Wait for that response to settle — two stable reads in a row — before typing,
    // so it can't race the fresh quote below and overwrite it when it resolves later.
    await expect(async () => {
      const before = await swapPage.outputAmount.inputValue()
      await swapPage.page.waitForTimeout(300)
      const after = await swapPage.outputAmount.inputValue()
      expect(before).not.toBe('')
      expect(before).toBe(after)
    }).toPass({ timeout: 10_000 })

    await swapPage.enterSellAmount('0.5')
    const sellAmount = 500_000_000_000_000_000n // 0.5 WETH
    // Waiting for the specific expected value (not just "non-empty") is what actually waits
    // out the debounce — the stale full-balance quote above already satisfies "non-empty".
    await expect(swapPage.outputAmount).toHaveValue(String((sellAmount * PRICE_FACTOR) / 10n ** 18n))

    await expect(swapPage.sellBalance).toHaveAttribute('title', '1 WETH')
    await expect(swapPage.buyBalance).toHaveAttribute('title', '0 USDC')

    await swapPage.clickSwap()
    await confirmModal.confirmButton.click()

    // The currency panels hide their balance while a trade is pending/just-submitted
    // (`CurrencyInputPanel` only renders it when `!disabled`). Posting the order opens the
    // order-progress screen (unmocked order status, so it sits on "still searching"
    // indefinitely) — its back arrow has no accessible name, but it dismisses on Escape,
    // returning to the normal, interactive swap form.
    await expect(swapPage.orderProgressBarModal).toContainText('Transaction completed!')
    await swapPage.page.keyboard.press('Escape')

    // Waits out the balances-watcher SSE reconnect that picks up the `postOrder`
    // override's update above — Playwright's `expect` polls until this passes.
    await expect(swapPage.sellBalance).toHaveAttribute('title', '0.5 WETH', { timeout: 150_000 })
    // The order's buyAmount is the quote's buyAmount minus the app's own slippage — assert
    // against what was actually posted (captured above) rather than re-deriving that math.
    await expect(swapPage.buyBalance).toHaveAttribute('title', `${BigInt(postedBuyAmount) / 10n ** 18n} USDC`, {
      timeout: 150_000,
    })
  })
})
