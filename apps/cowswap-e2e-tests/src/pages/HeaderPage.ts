import type { Locator, Page } from '@playwright/test'

/** The app-wide header (network selector, wallet status) — present on every route, not just Swap. */
export class HeaderPage {
  readonly page: Page
  readonly snackbarPopup: Locator

  constructor(page: Page) {
    this.page = page
    this.snackbarPopup = page.locator('.snackbar-popup').first()
  }

  /**
   * Opens the app's network selector (its trigger is an unlabelled `<div>`, so it's targeted by
   * the currently active network's own label text, scoped to the header to avoid ambiguity) and
   * picks `targetNetworkLabel` from the resulting dialog — the same flow a user driving the UI
   * would follow, as opposed to switching chains directly on the mocked wallet.
   */
  async switchNetwork(currentNetworkLabel: string, targetNetworkLabel: string): Promise<void> {
    await this.page.locator('#cowswap-app-header').getByText(currentNetworkLabel, { exact: true }).click()
    await this.page.getByRole('dialog').getByRole('button', { name: targetNetworkLabel, exact: true }).click()
  }
}
