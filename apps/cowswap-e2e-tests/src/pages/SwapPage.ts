import { TEST_IDS } from '@cowprotocol/test-ids'

import { expect } from '@playwright/test'

import { BridgeRoutePanel } from './BridgeRoutePanel'
import { TokenSelector } from './TokenSelector'

import type { TradePage } from './TradePage'
import type { Page, Locator } from '@playwright/test'

export class SwapPage implements TradePage {
  readonly page: Page
  readonly inputAmount: Locator
  readonly outputAmount: Locator
  readonly sellBalance: Locator
  readonly buyBalance: Locator
  readonly swapButton: Locator
  readonly approveButton: Locator
  /**
   * The actual primary CTA once form validation passes: `#do-trade-button` for a plain swap, but
   * `TradeApproveButton`'s `#approve-trade-button` instead whenever an ERC-20 allowance decision
   * applies (e.g. every cross-chain swap here) — regardless of whether its own label says
   * "Approve..." or, once the mocked allowance already covers the trade, "Swap and Bridge".
   * `swapButton`/`#do-trade-button` alone still covers every *disabled*, validation-blocking state
   * (`ButtonError` also renders under that same id), so this is only for the final ready-to-submit
   * click and its enabled/text assertions.
   */
  readonly primaryActionButton: Locator
  readonly arrowSeparator: Locator
  readonly maxButton: Locator
  readonly openOrders: Locator
  readonly tokens: TokenSelector
  readonly unlockButton: Locator
  readonly orderProgressBarModal: Locator
  readonly sellTokenSelect: Locator
  readonly buyTokenSelect: Locator
  readonly sellFiatAmount: Locator
  readonly buyFiatAmount: Locator
  readonly priceImpact: Locator
  readonly priceImpactTooltipTrigger: Locator
  readonly receiveAmountLabel: Locator
  readonly receiveAmountTooltipTrigger: Locator
  readonly receiveAmountValue: Locator
  readonly routePanel: BridgeRoutePanel
  /** `AddressInputPanel`'s wrapping `ReceiverPanel` — `id="recipient"` set by `SetRecipient`. */
  readonly recipientPanel: Locator
  /** `ReceiverPanelBody.container.tsx`'s `data-testid` on the `<input>` itself. */
  readonly recipientInput: Locator
  readonly recipientPasteButton: Locator
  /** Hardcoded id on `ReceiverConfirmationRow.pure.tsx`'s "confirm this is the right chain" checkbox. */
  readonly recipientConfirmationCheckbox: Locator
  /** `TradeApproveButton`'s toggle between "Partial approval" (a finite, trade-tied amount) and infinite (MaxUint256). */
  readonly approveModeSelector: Locator
  readonly settingsDialogButton: Locator
  readonly tradeFormActionButton: Locator
  readonly slippageInput: Locator
  /**
   * This validation state's button doesn't carry the `#do-trade-button` id the ordinary
   * swap/approve states do (`validateTradeForm.ts`'s `WrapUnwrapFlow`), so it's matched by text.
   */
  readonly wrapButton: Locator
  readonly unwrapButton: Locator
  /**
   * `TradeFormBlankButton`'s "Connect Wallet" — doesn't carry `#do-trade-button` either, and the
   * header has its own, differently-cased "Connect wallet" button, so this is matched `exact`.
   */
  readonly connectWalletButton: Locator

  constructor(page: Page) {
    this.page = page
    this.inputAmount = page.locator(`#input-currency-input [data-testid="${TEST_IDS.tokenAmountInput}"]`)
    this.outputAmount = page.locator(`#output-currency-input [data-testid="${TEST_IDS.tokenAmountInput}"]`)
    // `CurrencySelectButton` sets `aria-label="Selected token: <symbol>"`, which is a more
    // reliable read of the selected currency than the (truncatable) rendered symbol text.
    // `.open-currency-select-button` is a real styled-components class (also targeted by
    // `ReceiptModal.styled.ts`'s CSS), not a bare test hook — kept as a class per the "used in
    // CSS" rule instead of converting it to a `data-testid`.
    this.sellTokenSelect = page.locator('#input-currency-input .open-currency-select-button')
    this.buyTokenSelect = page.locator('#output-currency-input .open-currency-select-button')
    // The wallet balance shown under each amount field: `TokenAmount` sets the
    // exact-precision value + symbol (e.g. "0.5 WETH") as the `title` attribute,
    // which is the only titled element in either panel outside USD-values mode.
    this.sellBalance = page.locator(`#input-currency-input [data-testid="${TEST_IDS.currencyBalanceText}"] > span`)
    this.buyBalance = page.locator(`#output-currency-input [data-testid="${TEST_IDS.currencyBalanceText}"] > span`)
    this.sellFiatAmount = page.locator(`#input-currency-input [data-testid="${TEST_IDS.fiatAmount}"]`)
    this.buyFiatAmount = page.locator(`#output-currency-input [data-testid="${TEST_IDS.fiatAmount}"]`)
    // Only the output panel receives `priceImpactParams` (`TradeWidgetForm`), so price impact
    // only ever renders next to the buy-side USD estimation.
    this.priceImpact = page.locator(`#output-currency-input [data-testid="${TEST_IDS.priceImpact}"]`)
    // `HoverTooltip`'s mouseenter/mouseleave handlers sit on the innermost wrapper div around the
    // "(X%)" text, not on the outer `[data-testid]` span — hovering the outer span can land the
    // pointer outside that inner div's box and never open the tooltip.
    this.priceImpactTooltipTrigger = this.priceImpact.locator('div div')
    // `ReceiveAmount` wraps its label + `HelpTooltip` icon in its own `[data-testid]` div — no more
    // sibling/ancestor traversal needed to reach the tooltip's real `HoverTooltip` hitbox div.
    this.receiveAmountLabel = page.locator(`[data-testid="${TEST_IDS.receiveAmountLabel}"]`)
    // `div div` matches both the listener div and the icon-wrapper div nested inside it (same
    // quirk as `priceImpactTooltipTrigger` above), so take the first (outermost) match to land on
    // the listener div itself.
    this.receiveAmountTooltipTrigger = this.receiveAmountLabel.locator('div div').first()
    // The exact "<amount> <symbol>" value lives directly on `ReceiveAmountValue`'s own `title` +
    // `data-testid`.
    this.receiveAmountValue = page.locator(`[data-testid="${TEST_IDS.receiveAmountValue}"]`)
    this.swapButton = page.locator('#do-trade-button')
    this.approveButton = page.locator('#approve-trade-button')
    this.primaryActionButton = page.locator('#do-trade-button, #approve-trade-button')
    this.arrowSeparator = page.locator('#currency-arrow-separator')
    this.maxButton = page.getByRole('button', { name: /^max$/i })
    this.openOrders = page.locator(`[data-testid="${TEST_IDS.openOrdersList}"]`)
    this.unlockButton = page.locator('#unlock-cross-chain-swap-btn')
    this.orderProgressBarModal = page.locator('#order-progress-bar-modal')
    this.tokens = new TokenSelector(page)
    this.routePanel = new BridgeRoutePanel(page)
    this.recipientPanel = page.locator('#recipient')
    this.recipientInput = page.locator(`input[data-testid="${TEST_IDS.recipientAddressInput}"]`)
    this.recipientPasteButton = this.recipientPanel.getByText('Paste', { exact: true })
    this.recipientConfirmationCheckbox = page.locator('#receiver-confirmation')
    this.approveModeSelector = page.locator(`[data-testid="${TEST_IDS.approveModeSelector}"]`)
    this.settingsDialogButton = page.locator('#open-settings-dialog-button')
    this.tradeFormActionButton = page.locator(`[data-testid="${TEST_IDS.tradeFormBlankButton}"]`)
    this.slippageInput = page.locator('#slippage-input')
    this.wrapButton = page.getByRole('button', { name: 'Wrap', exact: true })
    this.unwrapButton = page.getByRole('button', { name: 'Unwrap', exact: true })
    this.connectWalletButton = page.getByRole('button', { name: 'Connect Wallet', exact: true })
  }

  async goto(opts: { chainId: number; sell?: string; buy?: string }): Promise<void> {
    const sell = opts.sell ?? ''
    const buy = opts.buy ?? ''
    await this.page.goto(`/#/${opts.chainId}/swap/${sell}/${buy}`, { waitUntil: 'domcontentloaded' })
    await this.unlockIfNeeded()
  }

  // The first visit shows an "unlock" intro screen instead of the order form — dismiss it.
  // Public: `MockWalletApi.openApp()` navigates directly (bypassing `goto()`), so callers using
  // it need to dismiss this screen themselves the same way.
  // The click can be swallowed by the trade widget's own state-reconciliation effects (chain/
  // provider sync still settling right after navigation, especially under CI load) — retry the
  // click until the form actually shows up instead of firing it once and hoping it stuck.
  async unlockIfNeeded(): Promise<void> {
    await this.unlockButton.or(this.tradeFormActionButton).first().waitFor({ state: 'visible' })
    if (!(await this.unlockButton.isVisible())) return

    await expect
      .poll(async () => {
        if (await this.unlockButton.isVisible()) {
          await this.unlockButton.click()
        }
        return this.inputAmount.isVisible()
      })
      .toBe(true)
  }

  /**
   * Waits until BOTH sell and buy currency selectors show a resolved token (i.e. neither still
   * reads `CurrencySelectButton`'s "Select a token" placeholder). Not run automatically by
   * `goto()`/`unlockIfNeeded()` — some flows (e.g. picking a Solana/Bitcoin destination) leave one
   * side genuinely unresolved on purpose, and would hang forever waiting on it.
   *
   * Call this before picking a *new* currency for one side via the token selector while relying on
   * the app's already-resolved value for the *other*, untouched side (typically right after
   * `goto()`, before the first `tokens.openInput()`/`openOutput()` + `searchAndPick()` call).
   * `useNavigateOnCurrencySelection`'s `lastKnownInputCurrencyIdRef`/`lastKnownOutputCurrencyIdRef`
   * (which exist specifically to preserve that untouched side) only latch once its currency has
   * actually resolved in React state — right after navigation that can still be in flight, and if
   * the picker action applies before it lands, the ref reads its unset initial value and wipes the
   * untouched side back to "no token selected" instead of preserving it. Observed as [CS-104]'s
   * sell balance check finding no `#input-currency-input` token at all.
   */
  async waitForBothCurrenciesResolved(): Promise<void> {
    await expect(this.sellTokenSelect).not.toHaveAttribute('aria-label', 'Select a token')
    await expect(this.buyTokenSelect).not.toHaveAttribute('aria-label', 'Select a token')
  }

  async waitForQuote(): Promise<void> {
    await this.arrowSeparator.waitFor({ state: 'visible' })
    await this.page.waitForFunction(
      () => !document.querySelector('#currency-arrow-separator')?.getAttribute('data-isLoading'),
      undefined,
      { timeout: 30_000 },
    )
  }

  async enterSellAmount(amount: string): Promise<void> {
    await this.inputAmount.fill(amount)
  }

  async enterBuyAmount(amount: string): Promise<void> {
    await this.outputAmount.fill(amount)
  }

  async clickMax(): Promise<void> {
    await this.maxButton.click()
  }

  async clickSwap(): Promise<void> {
    // The button briefly disables itself while price impact is still being computed ("Price
    // impact unknown") right after a fresh quote lands — clicking during that window is a no-op.
    await expect(this.swapButton).toBeEnabled()
    await this.swapButton.click()
  }

  async clickPrimaryAction(): Promise<void> {
    await expect(this.primaryActionButton).toBeEnabled()
    await this.primaryActionButton.click()
  }

  /** Opens the settings dropdown, sets a custom slippage percentage, and closes it again. */
  async setSlippage(percent: string): Promise<void> {
    await this.settingsDialogButton.click()
    await this.slippageInput.fill(percent)
    await this.slippageInput.blur()
    await this.page.keyboard.press('Escape')
  }
}
