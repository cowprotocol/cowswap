import type { Page, Locator } from '@playwright/test'

export class LimitPage {
  readonly page: Page
  readonly inputAmount: Locator
  readonly limitPriceInput: Locator
  readonly placeOrderButton: Locator
  readonly unlockButton: Locator

  constructor(page: Page) {
    this.page = page
    this.inputAmount = page.locator('#input-currency-input .token-amount-input')
    this.limitPriceInput = page.locator('[data-testid="limit-price-input"]')
    this.placeOrderButton = page.locator('#do-trade-button')
    this.unlockButton = page.locator('#unlock-limit-orders-btn')
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
}
