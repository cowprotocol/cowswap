import { Page, Locator } from '@playwright/test'

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

  /**
   * A stray overlay (e.g. a toast or a previous dialog's backdrop still fading out) can sit on top
   * of the toggle button and intercept the click, which Playwright surfaces as a timeout rather
   * than a silent no-op. Escape dismisses most such overlays, so retry once after that instead of
   * failing outright — a second failure still throws, so a genuinely broken toggle button isn't
   * masked.
   */
  async open(): Promise<void> {
    try {
      await this.toggleButton.click()
    } catch {
      await this.page.keyboard.press('Escape')
      await this.toggleButton.click()
    }
    await this.activitiesList.waitFor({ state: 'visible' })
  }

  /**
   * Content stays visible through the close transition after Escape, so polling visibility and
   * re-pressing Escape on every tick (as this used to) sent a redundant extra press that dismissed
   * unrelated UI still open elsewhere on the page ([CS-68]).
   */
  async close(): Promise<void> {
    if (!(await this.activitiesList.isVisible())) return

    await this.page.keyboard.press('Escape')
    try {
      await this.activitiesList.waitFor({ state: 'hidden' })
    } catch {
      await this.page.keyboard.press('Escape')
      await this.activitiesList.waitFor({ state: 'hidden' })
    }
  }
}
