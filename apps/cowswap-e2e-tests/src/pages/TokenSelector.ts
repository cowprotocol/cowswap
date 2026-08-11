import type { Page, Locator } from '@playwright/test'

export class TokenSelector {
  readonly page: Page
  readonly inputSelectButton: Locator
  readonly outputSelectButton: Locator
  readonly searchInput: Locator
  readonly currencyList: Locator

  constructor(page: Page) {
    this.page = page
    this.inputSelectButton = page.locator('#input-currency-input .open-currency-select-button')
    this.outputSelectButton = page.locator('#output-currency-input .open-currency-select-button')
    this.searchInput = page.locator('#token-search-input')
    this.currencyList = page.locator('#currency-list')
  }

  async openInput(): Promise<void> {
    await this.inputSelectButton.click()
  }

  async openOutput(): Promise<void> {
    await this.outputSelectButton.click()
  }

  async searchAndPick(symbolOrAddress: string): Promise<void> {
    await this.searchInput.fill(symbolOrAddress)
    await this.currencyList.getByText(symbolOrAddress, { exact: false }).first().click()
  }
}
