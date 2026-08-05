import type { Page } from '@playwright/test'

export class TokenSelector {
  constructor(private readonly page: Page) {}

  async openInput(): Promise<void> {
    await this.page.locator('#input-currency-input .open-currency-select-button').click()
  }

  async openOutput(): Promise<void> {
    await this.page.locator('#output-currency-input .open-currency-select-button').click()
  }

  async searchAndPick(symbolOrAddress: string): Promise<void> {
    const input = this.page.locator('#token-search-input')
    await input.fill(symbolOrAddress)
    await this.page.locator('#currency-list').getByText(symbolOrAddress, { exact: false }).first().click()
  }
}
