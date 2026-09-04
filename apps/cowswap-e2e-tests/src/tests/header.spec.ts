import type { Hex } from 'viem'

import { expect, test } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.use({
  mockWalletAutoConnect: false,
  mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined,
})

test.describe('Header', () => {
  test('[HD-01] Mobile menu remains fully visible when opened after page scroll @smoke', async ({
    swapPage,
    header,
  }) => {
    await swapPage.page.setViewportSize({ width: 375, height: 667 })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await swapPage.page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto'
      document.body.style.scrollBehavior = 'auto'
      window.scrollTo(0, 300)
    })
    expect(await swapPage.page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

    await header.openMobileMenu()

    await expect(swapPage.page.locator('body')).toHaveClass(/noScroll/)
    await expect(swapPage.page.locator('body')).toHaveCSS('overflow', 'hidden')
    await expect(swapPage.page.locator('html')).not.toHaveCSS('overflow', 'hidden')
    await expect(header.header).toBeInViewport({ ratio: 1 })
    await expect(header.mobileMenuTrigger).toBeInViewport({ ratio: 1 })
    await expect(header.mobileMenuTradeItem).toBeInViewport({ ratio: 1 })
    expect(Math.round(await header.header.evaluate((element) => element.getBoundingClientRect().top))).toBe(0)

    await header.closeMobileMenu()

    await expect(swapPage.page.locator('body')).not.toHaveClass(/noScroll/)
  })
})
