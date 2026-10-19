import { TEST_IDS } from '@cowprotocol/test-ids'

import { Page, Locator, expect } from '@playwright/test'

export class ConfirmModal {
  readonly page: Page
  readonly root: Locator
  readonly confirmButton: Locator
  readonly submittingButton: Locator
  readonly priceUpdatedBanner: Locator
  readonly minimumReceive: Locator

  constructor(page: Page) {
    this.page = page
    this.root = page.locator('#trade-confirmation')
    this.confirmButton = page.locator('#trade-confirmation > button')
    this.submittingButton = page.locator('#trade-confirmation > button[aria-busy="true"]')
    this.priceUpdatedBanner = page.getByText(/price updated/i)
    this.minimumReceive = page.getByText(/minimum receive/i)
  }

  /**
   * A requote can disable the trade button between Playwright's enabled check and the click
   * landing, turning the click into a silent no-op. Re-trigger only while the modal is still closed.
   */
  async openWith(trigger: () => Promise<void>): Promise<void> {
    await expect(async () => {
      if (!(await this.root.isVisible())) {
        await trigger()
      }
      await expect(this.root).toBeVisible({ timeout: 5_000 })
    }).toPass()
  }

  /**
   * A background quote refresh can land while this modal is open (`useTradeQuotePolling`'s
   * periodic-refresh effect isn't gated on the confirm modal being open) and flips `isPriceChanged`
   * true, disabling `confirmButton` until the "price updated" banner is dismissed. It can land between
   * Playwright's enabled check and the click, turning the click into a silent no-op, so re-click until
   * the button reports `aria-busy` (set on the same render as a click that went through) or the modal
   * moves on. A disabled or busy button is never clicked, so a landed click can't be sent twice.
   */
  async confirm(): Promise<void> {
    await expect(this.root).toBeVisible()

    const isSubmitted = async (): Promise<boolean> =>
      !(await this.root.isVisible()) || (await this.submittingButton.isVisible())

    await expect(async () => {
      if (await isSubmitted()) return

      if (await this.priceUpdatedBanner.isVisible()) {
        await this.priceUpdatedBanner.click()
      }
      await this.confirmButton.click({ timeout: 2_000 })
      await expect.poll(isSubmitted, { timeout: 3_000 }).toBe(true)
    }).toPass()
  }

  /** One of the modal's labeled `confirmOrderAmount` rows (e.g. "Maximum sent", "Expected to receive", "Minimum receive"). */
  amountRow(label: string): Locator {
    return this.page.locator(`[data-testid="${TEST_IDS.confirmOrderAmount}"]`, { hasText: label })
  }
}
