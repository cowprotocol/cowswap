import { TEST_IDS } from '@cowprotocol/test-ids'

import type { Page, Locator } from '@playwright/test'

/**
 * The "Route" breakdown shown under the swap form once a cross-chain quote loads
 * (`SwapRateDetails` → `TradeRateDetails` → `QuoteDetails`, rendering a swap leg then a bridge
 * leg). None of it carries `data-testid`/`id` at the row level — only i18n text — and several
 * labels repeat once per leg with no container id to key off, so rows here are matched by text
 * and disambiguated by DOM order (swap leg renders before bridge leg).
 */
export class BridgeRoutePanel {
  private readonly page: Page
  /** `TradeDetailsAccordion`'s `SummaryClickable` — the only stable (non-text) hook here. */
  readonly expandToggle: Locator
  readonly bridgeQuoteDetails: Locator
  readonly swapStopTitle: Locator
  /** `ProxyAccountBanner` — "Swap bridged via your Account Proxy: 0x..." (Bungee/Across). */
  readonly accountProxyBanner: Locator
  /** Same banner, Near Intents' "recipient overridden to the deposit address" variant (CC-17). */
  readonly modifiedRecipientBanner: Locator

  constructor(page: Page) {
    this.page = page
    // Not just `[aria-expanded]` — the app header's nav dropdown also renders `aria-expanded`, and
    // an unscoped `.first()` would resolve to whichever renders first in DOM order.
    this.expandToggle = page.locator(`[data-testid="${TEST_IDS.tradeDetailsAccordionToggle}"]`).first()
    this.bridgeQuoteDetails = page.locator(`[data-testid="${TEST_IDS.collapsibleBridgeRoute}"]`).first()
    // Not an exact match: `BridgeRouteTitle` renders "Swap on" and "CoW Protocol" either side of a
    // protocol icon, which can add whitespace/alt text into the element's normalized text content.
    this.swapStopTitle = page.getByText(/Swap on.*CoW Protocol/)
    this.accountProxyBanner = page.getByText(/^Swap bridged via your/)
    this.modifiedRecipientBanner = page.getByText(/^Modified recipient address to/)
  }

  bridgeStopTitle(providerName: 'Bungee' | 'Near Intents'): Locator {
    return this.page.getByText(new RegExp(`Bridge via.*${providerName}`))
  }

  /**
   * The toggle click occasionally doesn't register (e.g. a re-render swaps the element under the
   * pointer mid-click), leaving the panel collapsed. Retrying the click up to 3 times is more
   * reliable than firing it once and hoping it stuck.
   */
  async expand(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await this.bridgeQuoteDetails.isVisible()) return
      await this.expandToggle.click()
      if (await this.bridgeQuoteDetails.isVisible()) return
      await this.page.waitForTimeout(500)
    }
  }

  /**
   * The label's sibling `Content` cell (`ConfirmDetailsItem`'s `Row > Label, Content`).
   *
   * `getByText` resolves to the innermost element whose full text matches — for a label like
   * "Expected to receive" that's the `Label` span itself (a tooltip icon after it contributes no
   * text), but for one wrapped in an inner tag with nothing else inside (e.g. `Min. to receive`'s
   * `<b>` in `ReceiveAmountTitle`) it's that inner tag instead, which has no useful sibling of its
   * own. Walling up to the nearest `styled__Label-*` ancestor first — babel-plugin-styled-
   * components names every `styled.xxx` export after its variable, so any component's own
   * `Label` export produces this same class prefix — lands on `Content`'s actual sibling either way.
   */
  private detailContent(label: string | RegExp, occurrence = 0): Locator {
    const labelLocator =
      typeof label === 'string' ? this.page.getByText(label, { exact: true }) : this.page.getByText(label)
    return labelLocator
      .nth(occurrence)
      .locator('xpath=ancestor-or-self::*[contains(concat(" ", @class, " "), "__Label-")][1]')
      .locator('xpath=following-sibling::*[1]')
  }

  /** Reads a `TokenAmountDisplay` cell's exact value off its inner `[title]` (`LibTokenAmount`). */
  private amountValue(label: string, occurrence = 0): Locator {
    return this.detailContent(label, occurrence).locator('[title]').first()
  }

  // Swap leg (stop 1)
  /** `ProtocolFeeRow`'s "Protocol fee (X%)" when nonzero, `FreeFeeRow`'s plain "Fee" when free. */
  swapFee(): Locator {
    return this.detailContent(/^(Protocol fee|Fee)/)
  }
  swapNetworkCosts(): Locator {
    return this.detailContent('Network costs (est.)')
  }
  swapExpectedToReceive(): Locator {
    return this.amountValue('Expected to receive', 0)
  }
  swapMinToReceive(): Locator {
    return this.amountValue('Min. to receive', 0)
  }
  swapRecipient(): Locator {
    return this.detailContent('Recipient', 0)
  }
  /** Not an exact match: the label also carries the verification badge/tooltip after the text. */
  swapQuoteId(): Locator {
    return this.detailContent(/^Quote ID/)
  }

  // Bridge leg (stop 2)
  bridgeEstTime(): Locator {
    return this.detailContent('Est. bridge time')
  }
  bridgeCosts(): Locator {
    return this.detailContent('Bridge costs')
  }
  bridgeExpectedToReceive(): Locator {
    return this.amountValue('Expected to receive', 1)
  }
  bridgeMinToDeposit(): Locator {
    return this.amountValue('Min. to deposit', 0)
  }
  bridgeRecipient(): Locator {
    return this.detailContent('Recipient', 1)
  }
  bridgeMinToReceive(): Locator {
    return this.amountValue('Min. to receive', 1)
  }
}
