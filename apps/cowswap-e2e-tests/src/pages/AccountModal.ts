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
   * A single Escape flips the dialog's own open state immediately, but its content can stay
   * visible for a bit longer through its CSS close transition — so polling on DOM visibility and
   * re-pressing Escape on every poll tick (as this used to) sends extra, redundant presses while
   * the first one is still just animating out. Once the dialog has genuinely (not just visually)
   * closed, the app no longer treats that later Escape as "meant for this dialog" and lets it
   * reach whatever else on the page is also listening for it — dismissing unrelated UI that
   * happened to be open at the same time. `waitFor('hidden')` rides out that transition instead of
   * fighting it; only retry the Escape itself if the dialog genuinely never closed.
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
