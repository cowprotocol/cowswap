import { expect, type Locator, type Page } from '@playwright/test'

const BASE_PATH = '/rwa'
const PORTFOLIO_PATH = `${BASE_PATH}/portfolio`
// Scroll anchoring moves the page without any input when content above the viewport changes height, like the market
// overview collapsing once its aborted requests give up, which reads as a broken lock
const TALL_STABLE_PAGE_CSS =
  'body { overflow-anchor: none; } body::after { content: ""; display: block; height: 200vh; }'
const WHEEL_DELTA_PX = 300
const SCROLL_SETTLE_MS = 500
const RETRY_TIMEOUT_MS = 30_000

export class RwaPage {
  readonly menuButton: Locator
  readonly menu: Locator
  readonly searchButton: Locator
  readonly searchInput: Locator
  readonly closeSearchButton: Locator
  readonly filtersButton: Locator
  readonly filtersDrawer: Locator

  constructor(readonly page: Page) {
    this.menuButton = page.getByRole('button', { name: 'Menu', exact: true })
    this.menu = page.getByRole('navigation', { name: 'Menu', exact: true })
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true })
    this.searchInput = page.getByRole('combobox', { name: 'Search assets' })
    this.closeSearchButton = page.getByRole('button', { name: 'Close search' })
    // The open drawer hides the rest of the page from the accessibility tree, this button included
    this.filtersButton = page.getByRole('button', { name: 'Filters', exact: true, includeHidden: true })
    this.filtersDrawer = page.getByRole('dialog', { name: 'Filters' })
  }

  async goto(): Promise<void> {
    await this.blockLiveData()
    await this.page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' })
    await this.page.addStyleTag({ content: TALL_STABLE_PAGE_CSS })
  }

  async openMenu(): Promise<void> {
    await this.expand(this.menuButton)
    await expect(this.menu).toBeVisible()
  }

  async closeMenu(): Promise<void> {
    await this.menuButton.click()
    await expect(this.menu).toBeHidden()
  }

  async goToPortfolioFromMenu(): Promise<void> {
    await this.menu.getByRole('link', { name: 'Portfolio' }).click()
    await this.page.waitForURL(`**${PORTFOLIO_PATH}`)
    await expect(this.menu).toBeHidden()
  }

  async goBackHome(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' })
    await this.page.waitForURL(`**${BASE_PATH}`)
  }

  async openSearch(): Promise<void> {
    await this.expand(this.searchButton)
    await expect(this.searchInput).toBeVisible()
  }

  async closeSearch(): Promise<void> {
    await this.closeSearchButton.click()
    await expect(this.searchInput).toBeHidden()
  }

  async openFilters(): Promise<void> {
    await this.expand(this.filtersButton)
    await expect(this.filtersDrawer).toBeVisible()
  }

  async closeFilters(): Promise<void> {
    await this.filtersDrawer.getByRole('button', { name: /^Show / }).click()
    await expect(this.filtersDrawer).toBeHidden()
  }

  async expectPageScrolls(): Promise<void> {
    await this.waitForNextFrames()
    const scrollBefore = await this.readScrollY()
    const deltaY = scrollBefore > 0 ? -WHEEL_DELTA_PX : WHEEL_DELTA_PX

    await expect(async () => {
      await this.wheel(deltaY)
      await expect.poll(() => this.readScrollY(), { timeout: SCROLL_SETTLE_MS }).not.toBe(scrollBefore)
    }).toPass({ timeout: RETRY_TIMEOUT_MS })
  }

  async expectPageLocked(): Promise<void> {
    await this.waitForNextFrames()
    const scrollBefore = await this.readScrollY()

    await this.wheel(WHEEL_DELTA_PX)
    await this.page.waitForTimeout(SCROLL_SETTLE_MS)

    expect(await this.readScrollY()).toBe(scrollBefore)
  }

  private async blockLiveData(): Promise<void> {
    await this.page.route(
      ({ hostname, pathname }) => hostname !== 'localhost' || pathname.startsWith(`${BASE_PATH}/api/`),
      (route) => route.abort(),
    )
  }

  private async expand(trigger: Locator): Promise<void> {
    // A click that lands before hydration is lost, so retry until the trigger reports that it opened
    await expect(async () => {
      if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true', { timeout: 1_000 })
    }).toPass({ timeout: RETRY_TIMEOUT_MS })
  }

  private async wheel(deltaY: number): Promise<void> {
    const viewport = this.page.viewportSize()
    if (!viewport) throw new Error('RWA scroll tests need a fixed viewport')

    await this.page.mouse.move(viewport.width / 2, viewport.height / 2)

    const wheelSeen = await this.page.evaluateHandle(() => ({
      done: new Promise<void>((resolve) => {
        window.addEventListener('wheel', () => resolve(), { once: true, passive: true })
      }),
    }))

    await this.page.mouse.wheel(0, deltaY)
    await wheelSeen.evaluate(({ done }) => done)
  }

  private readScrollY(): Promise<number> {
    return this.page.evaluate(() => window.scrollY)
  }

  private async waitForNextFrames(): Promise<void> {
    await this.page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        }),
    )
  }
}
