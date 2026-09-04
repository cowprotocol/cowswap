import { TEST_IDS } from '@cowprotocol/test-ids'

import { Page, Locator, expect } from '@playwright/test'

export class ConfirmModal {
  readonly page: Page
  readonly confirmButton: Locator
  readonly priceUpdatedBanner: Locator
  readonly minimumReceive: Locator

  constructor(page: Page) {
    this.page = page
    this.confirmButton = page.locator('#trade-confirmation > button')
    this.priceUpdatedBanner = page.getByText(/price updated/i)
    this.minimumReceive = page.getByText(/minimum receive/i)
  }

  async confirm(): Promise<void> {
    await expect(this.confirmButton).toBeEnabled()
    await this.confirmButton.click()
  }

  /** One of the modal's labeled `confirmOrderAmount` rows (e.g. "Maximum sent", "Expected to receive", "Minimum receive"). */
  amountRow(label: string): Locator {
    return this.page.locator(`[data-testid="${TEST_IDS.confirmOrderAmount}"]`, { hasText: label })
  }
}
