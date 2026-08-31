import type { Page, Locator } from '@playwright/test'

export class AccountPage {
  readonly page: Page
  readonly overviewTab: Locator
  readonly tokensTab: Locator
  readonly affiliateTab: Locator
  readonly rewardsTab: Locator
  readonly proxyTab: Locator

  constructor(page: Page) {
    this.page = page
    this.overviewTab = page.getByRole('link', { name: /overview/i })
    this.tokensTab = page.getByRole('link', { name: /tokens/i })
    this.affiliateTab = page.getByRole('link', { name: /affiliate/i })
    this.rewardsTab = page.getByRole('link', { name: /my rewards/i })
    this.proxyTab = page.getByRole('link', { name: /account proxy/i })
  }

  async goto(
    section: 'overview' | 'tokens' | 'affiliate' | 'my-rewards' | 'account-proxy' = 'overview',
  ): Promise<void> {
    const path =
      section === 'overview' ? '/#/account' : section === 'account-proxy' ? '/#/account-proxy' : `/#/account/${section}`
    await this.page.goto(path)
  }
}
