import type { Page } from '@playwright/test'

export class TokenSelector {
  constructor(private readonly page: Page) {}

  async openInput(): Promise<void> {
    await this.page.locator('#input-currency-input .open-currency-select-button').click()
  }

  async openOutput(): Promise<void> {
    await this.page.locator('#output-currency-input .open-currency-select-button').click()
  }

  async searchAndPick(symbolOrAddress: string): Promise<void> {
    const input = this.page.locator('#token-search-input')
    await input.fill(symbolOrAddress)
    // `TokenListItem` sets `data-token-symbol`/`data-address` on the row itself — targeting those
    // directly (rather than the rendered text) avoids picking an unrelated element that merely
    // contains the search string, e.g. a tooltip icon next to the token's shortened address.
    const row = symbolOrAddress.startsWith('0x')
      ? this.page.locator(`[data-address="${symbolOrAddress.toLowerCase()}"]`)
      : this.page.locator(`[data-token-symbol="${symbolOrAddress}"]`)
    const firstRow = row.first()
    // `TokenListItem`'s click handler no-ops on the already-selected token (it's a picker, not a
    // toggle) — this happens whenever the requested token is already active, e.g. the app's own
    // duplicate-currency guard already swapped it into place while picking the other side. Dismiss
    // the same way a user finding nothing to click would, via the header's `BackButton`, which
    // installs its own Escape handler.
    const alreadySelected = await firstRow.evaluate((el) => el.classList.contains('token-item-selected'))
    if (alreadySelected) {
      await this.page.keyboard.press('Escape')
    } else {
      await firstRow.click()
    }
    await this.page.locator('#currency-list').waitFor({ state: 'hidden' })
  }
}
