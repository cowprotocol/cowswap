import { test } from '@playwright/test'

import { RwaPage } from '../pages/RwaPage'

test.describe('RWA page scroll lock', () => {
  let rwaPage: RwaPage

  test.beforeEach(async ({ page }) => {
    rwaPage = new RwaPage(page)
    await rwaPage.goto()
    await rwaPage.expectPageScrolls()
  })

  test('[RWA-01] hamburger menu locks the page until it closes', async () => {
    await rwaPage.openMenu()
    await rwaPage.expectPageLocked()

    await rwaPage.closeMenu()
    await rwaPage.expectPageScrolls()
  })

  test('[RWA-02] hamburger menu releases the page after browser Back', async () => {
    await rwaPage.openMenu()
    await rwaPage.goToPortfolioFromMenu()

    await rwaPage.openMenu()
    await rwaPage.expectPageLocked()

    await rwaPage.goBackHome()
    await rwaPage.expectPageScrolls()
  })

  test('[RWA-03] full-screen search locks the page until it closes', async () => {
    await rwaPage.openSearch()
    await rwaPage.expectPageLocked()

    await rwaPage.closeSearch()
    await rwaPage.expectPageScrolls()
  })

  test('[RWA-04] filters drawer locks the page until it closes', async () => {
    await rwaPage.openFilters()
    await rwaPage.expectPageLocked()

    await rwaPage.closeFilters()
    await rwaPage.expectPageScrolls()
  })
})
