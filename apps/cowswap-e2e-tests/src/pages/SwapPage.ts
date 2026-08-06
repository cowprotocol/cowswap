import { TokenSelector } from './TokenSelector'

import type { TradePage } from './TradePage'
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

  async enterBuyAmount(amount: string): Promise<void> {
    await this.outputAmount.fill(amount)
  }

  async clickMax(): Promise<void> {
    await this.maxButton.click()
  }

  async clickSwap(): Promise<void> {
    await this.swapButton.click()
  }
}
