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

  /**
   * A background quote refresh can land while this modal is open (`useTradeQuotePolling`'s
   * periodic-refresh effect isn't gated on the confirm modal being open) and flips `isPriceChanged`
   * true, disabling `confirmButton` until the resulting "price updated" banner is dismissed
   * (`PriceUpdatedBanner`'s `onClick={resetPriceChanged}`) — otherwise `toBeEnabled()` below just
   * waits out its timeout for a button that needs this extra click first. Dismissing it on every
   * poll attempt (rather than once up front) rides out the banner appearing mid-wait too.
   */
  async confirm(): Promise<void> {
    await expect
      .poll(async () => {
        if (await this.priceUpdatedBanner.isVisible()) {
          await this.priceUpdatedBanner.click()
        }
        return this.confirmButton.isEnabled()
      })
      .toBe(true)
    await this.confirmButton.click()
  }

  /** One of the modal's labeled `confirmOrderAmount` rows (e.g. "Maximum sent", "Expected to receive", "Minimum receive"). */
  amountRow(label: string): Locator {
    return this.page.locator(`[data-testid="${TEST_IDS.confirmOrderAmount}"]`, { hasText: label })
  }
}
