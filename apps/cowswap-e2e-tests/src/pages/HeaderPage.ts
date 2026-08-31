import type { Page, Locator } from '@playwright/test'

/** The app-wide header (network selector, wallet status) — present on every route, not just Swap. */
export class HeaderPage {
  readonly page: Page
  readonly header: Locator
  readonly networkDialog: Locator
  readonly snackbarPopup: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.locator('#cowswap-app-header')
    this.networkDialog = page.getByRole('dialog')
    this.snackbarPopup = page.locator('.snackbar-popup').first()
  }

  /**
   * Opens the app's network selector (its trigger is an unlabelled `<div>`, so it's targeted by
   * the currently active network's own label text, scoped to the header to avoid ambiguity).
   */
  async openNetworkSelector(currentNetworkLabel: string): Promise<void> {
    await this.header.getByText(currentNetworkLabel, { exact: true }).click()
    await this.networkDialog.waitFor({ state: 'visible' })
  }

  /** Switches through the same UI flow a user would drive instead of changing the mocked wallet directly. */
  async switchNetwork(currentNetworkLabel: string, targetNetworkLabel: string): Promise<void> {
    await this.openNetworkSelector(currentNetworkLabel)
    await this.networkDialog.getByRole('button', { name: targetNetworkLabel, exact: true }).click()
  }
}
