import type { Page, Locator } from '@playwright/test'

export class TwapPage {
  readonly page: Page
  readonly partsInput: Locator
  readonly durationInput: Locator
  readonly placeOrderButton: Locator

  constructor(page: Page) {
    this.page = page
    this.partsInput = page.locator('[data-testid="twap-parts-input"]')
    this.durationInput = page.locator('[data-testid="twap-duration-input"]')
    this.placeOrderButton = page.locator('#do-trade-button')
  }

  async goto(opts: { chainId: number; sell?: string; buy?: string }): Promise<void> {
    const sell = opts.sell ?? ''
    const buy = opts.buy ?? ''
    await this.page.goto(`/#/${opts.chainId}/advanced/${sell}/${buy}`)
  }
}
