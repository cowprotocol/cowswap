import type { TradePage } from './TradePage'
import type { Page, Locator } from '@playwright/test'

export class LimitPage implements TradePage {
  readonly page: Page
  readonly inputAmount: Locator
  readonly limitPriceInput: Locator
  readonly placeOrderButton: Locator
  readonly unlockButton: Locator
  readonly arrowSeparator: Locator

  constructor(page: Page) {
    this.page = page
    this.inputAmount = page.locator('#input-currency-input .token-amount-input')
    this.limitPriceInput = page.locator('#rate-limit-amount-input')
    this.placeOrderButton = page.locator('#do-trade-button')
    this.unlockButton = page.locator('#unlock-limit-orders-btn')
    this.arrowSeparator = page.locator('#currency-arrow-separator')
  }

  async goto(opts: { chainId: number; sell?: string; buy?: string }): Promise<void> {
    const sell = opts.sell ?? ''
    const buy = opts.buy ?? ''
    await this.page.goto(`/#/${opts.chainId}/limit/${sell}/${buy}`)
    await this.unlockIfNeeded()
  }

  // The first visit shows an "unlock" intro screen instead of the order form — dismiss it.
  private async unlockIfNeeded(): Promise<void> {
    await this.unlockButton.or(this.inputAmount).first().waitFor({ state: 'visible' })
    if (await this.unlockButton.isVisible()) {
      await this.unlockButton.click()
    }
  }

  async setLimitPrice(value: string): Promise<void> {
    await this.limitPriceInput.fill(value)
  }

  async enterSellAmount(amount: string): Promise<void> {
    await this.inputAmount.fill(amount)
  }

  async waitForQuote(): Promise<void> {
    await this.arrowSeparator.waitFor({ state: 'visible' })
    await this.page.waitForFunction(
      () => !document.querySelector('#currency-arrow-separator')?.getAttribute('data-isLoading'),
      undefined,
      { timeout: 30_000 },
    )
  }
}
