import { Order, OrderStatus, OrderCreation } from '@cowprotocol/sdk-order-book'

import { TokenSelector } from './TokenSelector'

import type { TradePage } from './TradePage'
import type { BalancesMock } from '../mocks/balances'
import type { CowProtocolApiMock } from '../mocks/cowProtocolApi'
import type { Page, Locator } from '@playwright/test'

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
   * Emulates the orderbook accepting whatever order gets posted next: makes `accountOrders`
   * reflect it as `open` right away. Posting alone does **not** settle it — call the returned
   * `fulfill()` whenever the test wants the trade to go through. `fulfill()` then keeps the
   * balances mock in sync with the trade (debits the sell token, credits the buy token), flips
   * the order to `fulfilled` in `accountOrders`, and makes `orderStatus` report it as `traded` —
   * the three things the real backend would eventually reflect once the trade settles on-chain.
   *
   * The returned handle also lets a caller read the posted buyAmount back once the order goes
   * through, since the app applies its own slippage on top of the quote — asserting on the
   * resulting balance needs the amount that was actually posted, not the pre-slippage quote.
   */
  mockOrderPosting(
    cowApi: CowProtocolApiMock,
    owner: string,
  ): {
    getPostedBuyAmount(): string
    fulfill(balances: BalancesMock, chainId: number, sellTokenBalanceBefore: bigint): void
  } {
    let postedBody: OrderCreation | null = null
    let postedOrder: Order | null = null

    // Starts out as the plain fixture list; once an order is posted, this starts prepending it —
    // open, then fulfilled once `fulfill()` runs — so "My orders" reflects the order's actual
    // lifecycle without the app ever seeing a real fill on-chain.
    cowApi.set('accountOrders', (req) => {
      const defaults = req.defaults as unknown[]
      return postedOrder ? [postedOrder, ...defaults] : defaults
    })

    cowApi.set('postOrder', (req) => {
      const body = req.body as OrderCreation
      const uid = req.defaults as string
      postedBody = body
      postedOrder = buildOpenOrder(body, uid, owner)
      return req.defaults
    })

    // `PendingOrdersUpdater` classifies pending orders (and decides whether a dismissed
    // progress modal should reopen) off this single-order endpoint rather than `orderStatus` —
    // without it, an order dismissed before `fulfill()` never gets picked back up.
    cowApi.set('order', (req) => postedOrder ?? req.defaults)

    return {
      getPostedBuyAmount: () => postedBody?.buyAmount ?? '',

      fulfill(balances: BalancesMock, chainId: number, sellTokenBalanceBefore: bigint): void {
        if (!postedBody || !postedOrder) {
          throw new Error('mockOrderPosting: fulfill() called before an order was posted')
        }

        balances.set(owner, chainId, {
          [postedBody.sellToken]: (sellTokenBalanceBefore - BigInt(postedBody.sellAmount)).toString(),
          [postedBody.buyToken]: postedBody.buyAmount,
        })

        postedOrder = { ...postedOrder, ...buildFulfilledOrderPatch(postedBody) }

        // Order-progress polls this once the order exists — "traded" is what moves it past
        // "still searching" to a fulfilled state, mirroring the same fill emulated above.
        cowApi.set('orderStatus', () => buildTradedOrderStatus(postedBody as OrderCreation))
      },
    }
  }
}

/** The subset of `PostedOrder` fields that change once the order actually settles. */
function buildFulfilledOrderPatch(
  body: OrderCreation,
): Pick<Order, 'status' | 'executedBuyAmount' | 'executedSellAmount' | 'executedSellAmountBeforeFees' | 'executedFee'> {
  return {
    status: OrderStatus.FULFILLED,
    executedBuyAmount: body.buyAmount,
    executedSellAmount: body.sellAmount,
    executedSellAmountBeforeFees: body.sellAmount,
    executedFee: '123000000000',
  }
}

/** The order as the orderbook would report it right after accepting it — not yet settled. */
function buildOpenOrder(body: OrderCreation, uid: string, owner: string): Order {
  return {
    creationDate: new Date().toISOString(),
    owner,
    uid,
    availableBalance: null,
    executedBuyAmount: '0',
    executedSellAmount: '0',
    executedSellAmountBeforeFees: '0',
    executedFeeAmount: '0',
    executedFee: '0',
    executedFeeToken: body.sellToken,
    invalidated: false,
    status: 'open',
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
  } as Order
}

/** What order-progress polls to learn a trade has settled — "traded" is what it waits for. */
function buildTradedOrderStatus(body: OrderCreation): { type: string; value: unknown[] } {
  return {
    type: 'traded',
    value: [
      {
        solver: '0x99b4136666ca1d13020830350ca8d01a0e5e466b',
        executedAmounts: { sell: body.sellAmount, buy: body.buyAmount },
      },
    ],
  }
}
