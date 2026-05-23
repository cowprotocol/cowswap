import type { Page, Locator } from '@playwright/test'

export class LimitPage {
  readonly page: Page
  readonly inputAmount: Locator
  readonly limitPriceInput: Locator
  readonly placeOrderButton: Locator

  constructor(page: Page) {
    this.page = page
    this.inputAmount = page.locator('#input-currency-input .token-amount-input')
    this.limitPriceInput = page.locator('[data-testid="limit-price-input"]')
    this.placeOrderButton = page.locator('#do-trade-button')
  }

  async goto(opts: { chainId: number; sell?: string; buy?: string }): Promise<void> {
    const sell = opts.sell ?? ''
    const buy = opts.buy ?? ''
    await this.page.goto(`/#/${opts.chainId}/limit/${sell}/${buy}`)
  }

  async setLimitPrice(value: string): Promise<void> {
    await this.limitPriceInput.fill(value)
  }
}
