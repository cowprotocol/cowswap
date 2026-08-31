import type { Page, Locator } from '@playwright/test'

/** The app-wide header (network selector, wallet status) — present on every route, not just Swap. */
export class HeaderPage {
  readonly page: Page
  readonly networkAndAccountControls: Locator
  readonly networkSelectorTrigger: Locator
  readonly networkDialog: Locator
  readonly snackbarPopup: Locator

  constructor(page: Page) {
    this.page = page
    this.networkAndAccountControls = page.locator('[data-testid="network-and-account-controls"]:visible')
    this.networkSelectorTrigger = this.networkAndAccountControls.getByTestId('network-selector-trigger')
    this.networkDialog = this.networkAndAccountControls.getByRole('dialog')
    this.snackbarPopup = page.locator('.snackbar-popup').first()
  }

  async openNetworkSelector(): Promise<void> {
    await this.networkSelectorTrigger.click()
    await this.networkDialog.waitFor({ state: 'visible' })
  }

  async closeNetworkSelector(): Promise<void> {
    await this.networkDialog.getByRole('button', { name: 'Close' }).click()
    await this.networkDialog.waitFor({ state: 'hidden' })
  }

  /** Switches through the same UI flow a user would drive instead of changing the mocked wallet directly. */
  async switchNetwork(targetNetworkLabel: string): Promise<void> {
    await this.openNetworkSelector()
    await this.networkDialog.getByRole('button', { name: targetNetworkLabel, exact: true }).click()
  }
}
