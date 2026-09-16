import { TEST_IDS } from '@cowprotocol/test-ids'

import { expect } from '@playwright/test'

import type { TradePage } from './TradePage'
import type { Page, Locator } from '@playwright/test'

export class LimitPage implements TradePage {
  readonly page: Page
  readonly inputAmount: Locator
  readonly limitPriceInput: Locator
  readonly placeOrderButton: Locator
  readonly unlockButton: Locator
  readonly arrowSeparator: Locator
  readonly orderSubmittedHeading: Locator
  readonly continueButton: Locator
  readonly myOrdersButton: Locator
  readonly openOrdersTab: Locator
  readonly ordersTable: Locator
  readonly tradeFormActionButton: Locator

  constructor(page: Page) {
    this.page = page
    this.inputAmount = page.locator(`#input-currency-input [data-testid="${TEST_IDS.tokenAmountInput}"]`)
    this.limitPriceInput = page.locator('#rate-limit-amount-input')
    this.placeOrderButton = page.locator('#do-trade-button')
    this.unlockButton = page.locator('#unlock-limit-orders-btn')
    this.arrowSeparator = page.locator('#currency-arrow-separator')
    this.orderSubmittedHeading = page.getByRole('heading', { name: 'Order Submitted' })
    this.continueButton = page.getByRole('button', { name: /continue/i })
    this.myOrdersButton = page.getByRole('button', { name: 'My orders' })
    this.openOrdersTab = page.locator(`[data-testid="${TEST_IDS.ordersTableTab}"]`, { hasText: 'Open' })
    this.ordersTable = page.locator('#orders-table')
    this.tradeFormActionButton = page.locator(`[data-testid="${TEST_IDS.tradeFormBlankButton}"]`)
  }

  async goto(opts: { chainId: number; sell?: string; buy?: string }): Promise<void> {
    const sell = opts.sell ?? ''
    const buy = opts.buy ?? ''
    await this.page.goto(`/#/${opts.chainId}/limit/${sell}/${buy}`)
    await this.unlockIfNeeded()
  }

  // The first visit shows an "unlock" intro screen instead of the order form — dismiss it.
  // The click can be swallowed by the trade widget's own state-reconciliation effects (chain/
  // provider sync still settling right after navigation, especially under CI load) — retry the
  // click until the form actually shows up instead of firing it once and hoping it stuck.
  private async unlockIfNeeded(): Promise<void> {
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

  async setLimitPrice(value: string): Promise<void> {
    await this.limitPriceInput.fill(value)
  }

  async placeOrder(): Promise<void> {
    await expect(this.placeOrderButton).toBeEnabled()
    await this.placeOrderButton.click()
  }

  async enterSellAmount(amount: string): Promise<void> {
    await this.inputAmount.fill(amount)
  }

  async waitForQuote(): Promise<void> {
    await this.arrowSeparator.waitFor({ state: 'visible' })
    await this.page.waitForFunction(
      () => !document.querySelector('#currency-arrow-separator')?.getAttribute('data-isLoading'),
      undefined,
      { timeout: 30_000 },
    )
  }

  // Below the "large" breakpoint (1280px — Playwright's default Desktop Chrome viewport width),
  // the orders table renders in a closed drawer instead of inline, so it needs this button to open
  // it first. Above that breakpoint the table is already inline and this button doesn't render.
  async openOrders(): Promise<void> {
    if (await this.myOrdersButton.isVisible()) {
      await this.myOrdersButton.click()
    }
    await this.openOrdersTab.click()
  }
}
