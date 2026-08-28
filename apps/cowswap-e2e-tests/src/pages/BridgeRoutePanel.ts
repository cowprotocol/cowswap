import { TEST_IDS } from '@cowprotocol/test-ids'

import type { Page, Locator } from '@playwright/test'

/**
 * The "Route" breakdown shown under the swap form once a cross-chain quote loads
 * (`SwapRateDetails` → `TradeRateDetails` → `QuoteDetails`, rendering a swap leg then a bridge
 * leg). Each row carries its own `data-testid` (`ConfirmDetailsItem`'s `testId` prop, threaded
 * through `QuoteSwapContent`/`QuoteBridgeContent` — see `libs/test-ids`'s `routeSwap*`/
 * `routeBridge*` entries), distinct per swap-leg/bridge-leg row so there's no need to disambiguate
 * same-labeled rows by DOM order the way plain text matching would require.
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

  /** A row's whole `ConfirmDetailsItem` container (label + content), keyed by its own `data-testid`. */
  private routeRow(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`)
  }

  /** Reads a row's `TokenAmountDisplay` cell off its inner `[title]` (`LibTokenAmount`). */
  private routeAmount(testId: string): Locator {
    return this.routeRow(testId).locator('[title]').first()
  }

  // Swap leg (stop 1)
  /** `ProtocolFeeRow`'s "Protocol fee (X%)" when nonzero, `FreeFeeRow`'s plain "Fee" when free. */
  swapFee(): Locator {
    return this.routeRow(TEST_IDS.routeSwapFee)
  }
  swapNetworkCosts(): Locator {
    return this.routeRow(TEST_IDS.routeSwapNetworkCosts)
  }
  swapExpectedToReceive(): Locator {
    return this.routeAmount(TEST_IDS.routeSwapExpectedToReceive)
  }
  swapMinToReceive(): Locator {
    return this.routeAmount(TEST_IDS.routeSwapMinToReceive)
  }
  swapRecipient(): Locator {
    return this.routeRow(TEST_IDS.routeSwapRecipient)
  }
  swapQuoteId(): Locator {
    return this.routeRow(TEST_IDS.routeSwapQuoteId)
  }

  // Bridge leg (stop 2)
  bridgeEstTime(): Locator {
    return this.routeRow(TEST_IDS.routeBridgeEstTime)
  }
  bridgeCosts(): Locator {
    return this.routeRow(TEST_IDS.routeBridgeCosts)
  }
  bridgeExpectedToReceive(): Locator {
    return this.routeAmount(TEST_IDS.routeBridgeExpectedToReceive)
  }
  bridgeMinToDeposit(): Locator {
    return this.routeAmount(TEST_IDS.routeBridgeMinToDeposit)
  }
  bridgeRecipient(): Locator {
    return this.routeRow(TEST_IDS.routeBridgeRecipient)
  }
  bridgeMinToReceive(): Locator {
    return this.routeAmount(TEST_IDS.routeBridgeMinToReceive)
  }
}
