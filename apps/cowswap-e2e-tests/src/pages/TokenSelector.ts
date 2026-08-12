import type { Page, Locator } from '@playwright/test'

export class TokenSelector {
  readonly page: Page
  readonly inputSelectButton: Locator
  readonly outputSelectButton: Locator
  readonly searchInput: Locator
  readonly currencyList: Locator

  constructor(page: Page) {
    this.page = page
    this.inputSelectButton = page.locator('#input-currency-input .open-currency-select-button')
    this.outputSelectButton = page.locator('#output-currency-input .open-currency-select-button')
    this.searchInput = page.locator('#token-search-input')
    this.currencyList = page.locator('#currency-list')
  }

  async openInput(): Promise<void> {
    await this.inputSelectButton.click()
  }

  async openOutput(): Promise<void> {
    await this.outputSelectButton.click()
  }

  /**
   * Picks a destination network in the token picker's chain panel (only rendered when the field
   * being picked for is bridging-eligible — see `useChainPanelState`). Chain rows have no
   * `data-testid`; `ChainButton` renders only the chain's `label` text (e.g. "Arbitrum", "Base",
   * "BNB", "Solana", "Bitcoin" — see `@cowprotocol/sdk-config`'s chain definitions).
   */
  async selectChain(chainLabel: string): Promise<void> {
    await this.page.getByText(chainLabel, { exact: true }).click()
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
