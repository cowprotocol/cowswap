import type { Page, Locator } from '@playwright/test'

/**
 * The wallet-details side panel opened from the header's connected-wallet button. It has no
 * `role="dialog"` and no dedicated close button locator (the panel's own `X` has no accessible
 * name) — `#web3-status-connected` is a toggle, so clicking it again is the panel's close action
 * too.
 */
export class AccountModal {
  readonly page: Page
  readonly toggleButton: Locator
  readonly activitiesList: Locator

  constructor(page: Page) {
    this.page = page
    this.toggleButton = page.locator('#web3-status-connected')
    this.activitiesList = page.locator('#account-activities-list')
  }

  async open(): Promise<void> {
    await this.toggleButton.click()
    await this.activitiesList.waitFor({ state: 'visible' })
  }

  async close(): Promise<void> {
    await this.toggleButton.click()
    await this.activitiesList.waitFor({ state: 'hidden' })
  }
}
