import { getAddressKey } from '@cowprotocol/cow-sdk'

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
    await this.retryOpen(this.inputSelectButton)
  }

  async openOutput(): Promise<void> {
    await this.retryOpen(this.outputSelectButton)
  }

  /**
   * A click meant to open the picker can occasionally get lost to a re-render — e.g. picking a
   * token that collides with the currency already on the opposite side triggers the app's own
   * auto-swap, and a click landing right as that swap re-renders the select button can register
   * as a successful Playwright click (no error) without the picker actually opening. Observed as
   * [CS-60]'s `#token-search-input` fill hanging for the full 15s timeout with no modal ever
   * visible in the failing run's own trace screenshots — the click before it had silently done
   * nothing.
   *
   * Retries with a single extra click, not a tight poll-and-reclick loop: the picker's own open
   * transition takes a real moment, and a poll whose interval is shorter than that transition
   * would keep re-clicking (and, worse, could land on the picker's own just-opened content) before
   * it ever finishes — a first attempt at this fix did exactly that and got stuck indefinitely
   * despite the picker visibly being open in the trace's own screenshots.
   */
  private async retryOpen(button: Locator): Promise<void> {
    await button.click()
    try {
      await this.searchInput.waitFor({ state: 'visible', timeout: 3_000 })
    } catch {
      await button.click()
      await this.searchInput.waitFor({ state: 'visible' })
    }
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
      ? this.page.locator(`[data-address="${getAddressKey(symbolOrAddress)}"]`)
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
