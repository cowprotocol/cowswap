import type { Page, Locator } from '@playwright/test'

/**
 * The wallet-details panel opened from the header's connected-wallet button. Since the
 * Dialog/surfaces refactor (`AccountModal.container.tsx`'s `<Dialog>`) it's a real modal with its
 * own backdrop and `role="dialog"` — the backdrop now covers `#web3-status-connected`, so clicking
 * the toggle button again no longer closes it (the click is intercepted by the dialog's own
 * overlay). Closing goes through the dialog's `ModalHeader` close button instead, which the shared
 * `CloseIconButton` primitive gives an accessible `aria-label="Close"`.
 */
export class AccountModal {
  readonly page: Page
  readonly toggleButton: Locator
  readonly closeButton: Locator
  readonly activitiesList: Locator
  /** Confirms cancellation in `RequestCancellationModal`, opened via an activity row's "Cancel order" link. */
  readonly requestCancellationButton: Locator

  constructor(page: Page) {
    this.page = page
    this.toggleButton = page.locator('#web3-status-connected')
    this.closeButton = page.getByRole('dialog').getByRole('button', { name: 'Close' })
    this.activitiesList = page.locator('#account-activities-list')
    this.requestCancellationButton = page.getByRole('button', { name: 'Request cancellation' })
  }

  async open(): Promise<void> {
    await this.toggleButton.click()
    await this.activitiesList.waitFor({ state: 'visible' })
  }

  async close(): Promise<void> {
    await this.closeButton.click()
    await this.activitiesList.waitFor({ state: 'hidden' })
  }
}
