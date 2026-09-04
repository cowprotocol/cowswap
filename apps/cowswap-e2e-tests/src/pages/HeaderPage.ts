import type { Page, Locator } from '@playwright/test'

/** The app-wide header (network selector, wallet status) — present on every route, not just Swap. */
export class HeaderPage {
  readonly page: Page
  readonly header: Locator
  readonly mobileMenu: Locator
  readonly mobileMenuTradeItem: Locator
  readonly mobileMenuTrigger: Locator
  readonly networkDialog: Locator
  readonly snackbarPopup: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.locator('#cowswap-app-header')
    this.mobileMenu = this.header.getByTestId('mobile-menu')
    this.mobileMenuTradeItem = this.mobileMenu.getByText('Trade', { exact: true })
    this.mobileMenuTrigger = this.header.getByTestId('mobile-menu-trigger')
    this.networkDialog = page.getByRole('dialog')
    this.snackbarPopup = page.locator('.snackbar-popup').first()
  }

  async closeMobileMenu(): Promise<void> {
    await this.mobileMenuTrigger.click()
    await this.mobileMenu.waitFor({ state: 'hidden' })
  }

  async openMobileMenu(): Promise<void> {
    await this.mobileMenuTrigger.click()
    await this.mobileMenu.waitFor({ state: 'visible' })
  }

  /**
   * Opens the app's network selector (its trigger is an unlabelled `<div>`, so it's targeted by
   * the currently active network's own label text, scoped to the header to avoid ambiguity) and
   * picks `targetNetworkLabel` from the resulting dialog — the same flow a user driving the UI
   * would follow, as opposed to switching chains directly on the mocked wallet.
   */
  async switchNetwork(currentNetworkLabel: string, targetNetworkLabel: string): Promise<void> {
    await this.header.getByText(currentNetworkLabel, { exact: true }).click()
    await this.networkDialog.getByRole('button', { name: targetNetworkLabel, exact: true }).click()
  }
}
