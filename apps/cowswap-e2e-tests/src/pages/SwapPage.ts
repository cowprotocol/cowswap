import { TokenSelector } from './TokenSelector'

import type { TradePage } from './TradePage'
import type { BalancesMock } from '../mocks/balances'
import type { CowProtocolApiMock } from '../mocks/cowProtocolApi'
import type { Page, Locator } from '@playwright/test'

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

export class SwapPage implements TradePage {
  readonly page: Page
  readonly inputAmount: Locator
  readonly outputAmount: Locator
  readonly sellBalance: Locator
  readonly buyBalance: Locator
  readonly swapButton: Locator
  readonly approveButton: Locator
  readonly arrowSeparator: Locator
  readonly maxButton: Locator
  readonly openOrders: Locator
  readonly tokens: TokenSelector
  readonly unlockButton: Locator
  readonly orderProgressBarModal: Locator
  readonly sellTokenSelect: Locator
  readonly buyTokenSelect: Locator

  constructor(page: Page) {
    this.page = page
    this.inputAmount = page.locator('#input-currency-input .token-amount-input')
    this.outputAmount = page.locator('#output-currency-input .token-amount-input')
    // `CurrencySelectButton` sets `aria-label="Selected token: <symbol>"`, which is a more
    // reliable read of the selected currency than the (truncatable) rendered symbol text.
    this.sellTokenSelect = page.locator('#input-currency-input .open-currency-select-button')
    this.buyTokenSelect = page.locator('#output-currency-input .open-currency-select-button')
    // The wallet balance shown under each amount field: `TokenAmount` sets the
    // exact-precision value + symbol (e.g. "0.5 WETH") as the `title` attribute,
    // which is the only titled element in either panel outside USD-values mode.
    this.sellBalance = page.locator('#input-currency-input .currency-balance-text > span')
    this.buyBalance = page.locator('#output-currency-input .currency-balance-text > span')
    this.swapButton = page.locator('#do-trade-button')
    this.approveButton = page.locator('#approve-trade-button')
    this.arrowSeparator = page.locator('#currency-arrow-separator')
    this.maxButton = page.getByRole('button', { name: /^max$/i })
    this.openOrders = page.locator('[data-testid="open-orders-list"]')
    this.unlockButton = page.locator('#unlock-cross-chain-swap-btn')
    this.orderProgressBarModal = page.locator('#order-progress-bar-modal')
    this.tokens = new TokenSelector(page)
  }

  async goto(opts: { chainId: number; sell?: string; buy?: string }): Promise<void> {
    const sell = opts.sell ?? ''
    const buy = opts.buy ?? ''
    await this.page.goto(`/#/${opts.chainId}/swap/${sell}/${buy}`)
    await this.unlockIfNeeded()
  }

  // The first visit shows an "unlock" intro screen instead of the order form — dismiss it.
  private async unlockIfNeeded(): Promise<void> {
    await this.unlockButton.or(this.inputAmount).first().waitFor({ state: 'visible' })
    if (await this.unlockButton.isVisible()) {
      await this.unlockButton.click()
    }
  }

  async waitForQuote(): Promise<void> {
    await this.arrowSeparator.waitFor({ state: 'visible' })
    await this.page.waitForFunction(
      () => !document.querySelector('#currency-arrow-separator')?.getAttribute('data-isLoading'),
      undefined,
      { timeout: 30_000 },
    )
  }

  async enterSellAmount(amount: string): Promise<void> {
    await this.inputAmount.fill(amount)
  }

  async clickMax(): Promise<void> {
    await this.maxButton.click()
  }

  async clickSwap(): Promise<void> {
    await this.swapButton.click()
  }

  /**
   * Emulates the orderbook fulfilling whatever order gets posted next: keeps the balances mock
   * in sync with the trade (debits the sell token, credits the buy token), makes `accountOrders`
   * include it as `fulfilled`, and makes `orderStatus` report it as `traded` — the three things
   * the real backend would eventually reflect once the trade settles on-chain.
   *
   * Returns a handle to read the posted buyAmount back once the order goes through, since the
   * app applies its own slippage on top of the quote — a caller asserting on the resulting
   * balance needs the amount that was actually posted, not the pre-slippage quote.
   */
  mockSwapFulfillment(
    cowApi: CowProtocolApiMock,
    balances: BalancesMock,
    owner: string,
    chainId: number,
    sellTokenBalanceBefore: bigint,
  ): { getPostedBuyAmount(): string } {
    let postedOrder: Record<string, unknown> | null = null
    let postedBuyAmount = ''

    // Starts out as the plain fixture list; once the order below is posted, this starts
    // prepending it — fulfilled — so "My orders" reflects the trade emulated as settled in the
    // orderbook, without the app ever seeing a real fill on-chain.
    cowApi.set('accountOrders', (req) => {
      const defaults = req.defaults as unknown[]
      return postedOrder ? [postedOrder, ...defaults] : defaults
    })

    cowApi.set('postOrder', (req) => {
      const body = req.body as PostOrderBody
      const uid = req.defaults as string
      postedBuyAmount = body.buyAmount

      const balancesUpdate = {
        [body.sellToken]: (sellTokenBalanceBefore - BigInt(body.sellAmount)).toString(),
        [body.buyToken]: body.buyAmount,
      }

      balances.set(owner, chainId, balancesUpdate)

      console.log('[E2E] balances update after swap fulfillment', balancesUpdate)

      postedOrder = {
        creationDate: new Date().toISOString(),
        owner,
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
      cowApi.set('orderStatus', () => ({
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

    return { getPostedBuyAmount: () => postedBuyAmount }
  }
}
