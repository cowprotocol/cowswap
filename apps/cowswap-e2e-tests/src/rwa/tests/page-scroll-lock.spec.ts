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
    await rwaPage.makeFiltersListOverflow()
    await rwaPage.expectPageLockedOverBackdrop()

    await rwaPage.closeFilters()
    await rwaPage.expectPageScrolls()
  })

  test('[RWA-05] page stays locked until both the search and the menu under it close', async () => {
    await rwaPage.openMenu()
    await rwaPage.openSearchWithShortcut()
    await rwaPage.expectPageLocked()

    await rwaPage.closeSearchWithEscapeOverMenu()
    await rwaPage.expectPageLocked()

    await rwaPage.closeMenuWithEscape()
    await rwaPage.expectPageScrolls()
  })

  test('[RWA-06] filters drawer releases the page when the viewport grows past phone width', async () => {
    await rwaPage.openFilters()
    await rwaPage.expectPageLockedOverBackdrop()

    await rwaPage.resizePastPhoneWidthClosingFilters()
    await rwaPage.expectPageScrolls()
  })
})

test.describe('RWA page scroll lock on touch', () => {
  test.use({ isMobile: true, hasTouch: true })

  let rwaPage: RwaPage

  test.beforeEach(async ({ page }) => {
    rwaPage = new RwaPage(page)
    await rwaPage.goto()
    await rwaPage.expectPageScrollsOnSwipe()
  })

  test('[RWA-07] hamburger menu locks the page against a swipe until it closes', async () => {
    await rwaPage.openMenu()
    await rwaPage.expectPageLockedOnSwipe()

    await rwaPage.closeMenu()
    await rwaPage.expectPageScrollsOnSwipe()
  })

  test('[RWA-08] full-screen search locks the page against a swipe until it closes', async () => {
    await rwaPage.openSearch()
    await rwaPage.expectPageLockedOnSwipe()

    await rwaPage.closeSearch()
    await rwaPage.expectPageScrollsOnSwipe()
  })
})
