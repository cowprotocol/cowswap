import type { Page, Locator } from '@playwright/test'

export class ConfirmModal {
  readonly confirmButton: Locator
  readonly priceUpdatedBanner: Locator
  readonly minimumReceive: Locator

  constructor(page: Page) {
    this.confirmButton = page.locator('#trade-confirmation > button')
    this.priceUpdatedBanner = page.getByText(/price updated/i)
    this.minimumReceive = page.getByText(/minimum receive/i)
  }
}
