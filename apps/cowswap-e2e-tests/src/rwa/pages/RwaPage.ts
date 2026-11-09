import { expect, type Locator, type Page } from '@playwright/test'

interface Point {
  x: number
  y: number
}

type ScrollInput = (point: Point, deltaY: number) => Promise<void>

const BASE_PATH = '/rwa'
const PORTFOLIO_PATH = `${BASE_PATH}/portfolio`
// Scroll anchoring moves the page without any input when content above the viewport changes height, like the market
// overview collapsing once its aborted requests give up, which reads as a broken lock
const TALL_STABLE_PAGE_CSS =
  'body { overflow-anchor: none; } body::after { content: ""; display: block; height: 200vh; }'
const SCROLL_DELTA_PX = 300
const SWIPE_STEPS = 10
const SWIPE_HOLD_MS = 150
const SCROLL_SETTLE_MS = 500
const RETRY_TIMEOUT_MS = 30_000
const BACKDROP_Y_PX = 30
const PAST_PHONE_WIDTH_PX = 800
// Mirrors COOKIE_CONSENT_NAME and COOKIE_CONSENT_POLICY_VERSION in libs/analytics/src/consent, which this app doesn't depend on
const COOKIE_CONSENT_NAME = 'cowCookieConsent'
const COOKIE_CONSENT_POLICY_VERSION = 1

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
    await this.storeCookieChoice()
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

  async closeMenuWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
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

  async openSearchWithShortcut(): Promise<void> {
    await this.page.keyboard.press('/')
    await expect(this.searchInput).toBeVisible()
  }

  async closeSearch(): Promise<void> {
    await this.closeSearchButton.click()
    await expect(this.searchInput).toBeHidden()
  }

  async closeSearchWithEscapeOverMenu(): Promise<void> {
    await this.page.keyboard.press('Escape')
    await expect(this.searchInput).toBeHidden()
    await expect(this.menu).toBeVisible()
  }

  async openFilters(): Promise<void> {
    await this.expand(this.filtersButton)
    await expect(this.filtersDrawer).toBeVisible()
  }

  async closeFilters(): Promise<void> {
    await this.filtersDrawer.getByRole('button', { name: /^Show / }).click()
    await expect(this.filtersDrawer).toBeHidden()
  }

  async resizePastPhoneWidthClosingFilters(): Promise<void> {
    await this.page.setViewportSize({ width: PAST_PHONE_WIDTH_PX, height: this.getViewport().height })
    await expect(this.filtersDrawer).toBeHidden()
  }

  async makeFiltersListOverflow(): Promise<void> {
    // Blocked data leaves the list short, but real data makes it overflow and catch any wheel over it
    await this.filtersDrawer.evaluate((drawer) => {
      const list = Array.from(drawer.querySelectorAll('*')).find(
        (element) => getComputedStyle(element).overflowY === 'auto',
      )
      if (!list) throw new Error('The filters drawer has no scrollable list')

      const filler = document.createElement('div')
      filler.style.height = '200vh'
      list.append(filler)
    })
  }

  async expectPageScrolls(): Promise<void> {
    await this.expectScrolls((point, deltaY) => this.wheel(point, deltaY))
  }

  async expectPageScrollsOnSwipe(): Promise<void> {
    await this.expectScrolls((point, deltaY) => this.swipe(point, deltaY))
  }

  async expectPageLocked(): Promise<void> {
    await this.expectLocked((point, deltaY) => this.wheel(point, deltaY), this.getViewportCenter())
  }

  async expectPageLockedOverBackdrop(): Promise<void> {
    const point = { x: this.getViewportCenter().x, y: BACKDROP_Y_PX }

    await this.expectLocked((wheelPoint, deltaY) => this.wheel(wheelPoint, deltaY), point)
  }

  async expectPageLockedOnSwipe(): Promise<void> {
    await this.expectLocked((point, deltaY) => this.swipe(point, deltaY), this.getViewportCenter())
  }

  private async expectScrolls(scroll: ScrollInput): Promise<void> {
    await this.waitForNextFrames()
    const scrollBefore = await this.readScrollY()
    const deltaY = scrollBefore > 0 ? -SCROLL_DELTA_PX : SCROLL_DELTA_PX

    await expect(async () => {
      await scroll(this.getViewportCenter(), deltaY)
      await expect.poll(() => this.readScrollY(), { timeout: SCROLL_SETTLE_MS }).not.toBe(scrollBefore)
    }).toPass({ timeout: RETRY_TIMEOUT_MS })
  }

  private async expectLocked(scroll: ScrollInput, point: Point): Promise<void> {
    await this.waitForNextFrames()
    await this.expectNoScrollerUnder(point)
    const scrollBefore = await this.readScrollY()

    await scroll(point, SCROLL_DELTA_PX)
    await this.page.waitForTimeout(SCROLL_SETTLE_MS)

    expect(await this.readScrollY()).toBe(scrollBefore)
  }

  private async expectNoScrollerUnder(point: Point): Promise<void> {
    const scroller = await this.page.evaluate(({ x, y }) => {
      let element = document.elementFromPoint(x, y)

      while (element && element !== document.body && element !== document.documentElement) {
        const { overflowY } = getComputedStyle(element)
        const canScroll = overflowY === 'auto' || overflowY === 'scroll'

        if (canScroll && element.scrollHeight > element.clientHeight) return element.outerHTML.slice(0, 100)

        element = element.parentElement
      }

      return null
    }, point)

    expect(scroller, 'This element would absorb the input, so the page stays still with or without a lock').toBeNull()
  }

  private async blockLiveData(): Promise<void> {
    await this.page.route(
      ({ hostname, pathname }) => hostname !== 'localhost' || pathname.startsWith(`${BASE_PATH}/api/`),
      (route) => route.abort(),
    )
  }

  // A stored rejection keeps the cookie banner, which sits over the bottom of the page, out of the scroll assertions
  private async storeCookieChoice(): Promise<void> {
    await this.page.addInitScript(
      ({ name, policyVersion }) => {
        const record = { v: 1, choice: 'rejected', decidedAt: new Date().toISOString(), policyVersion }

        document.cookie = `${name}=${encodeURIComponent(JSON.stringify(record))}; Path=/`
      },
      { name: COOKIE_CONSENT_NAME, policyVersion: COOKIE_CONSENT_POLICY_VERSION },
    )
  }

  private async expand(trigger: Locator): Promise<void> {
    // A click that lands before hydration is lost, so retry until the trigger reports that it opened
    await expect(async () => {
      if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true', { timeout: 1_000 })
    }).toPass({ timeout: RETRY_TIMEOUT_MS })
  }

  private async wheel({ x, y }: Point, deltaY: number): Promise<void> {
    await this.page.mouse.move(x, y)

    // The wrapper object stops `evaluateHandle` awaiting the promise, which only settles after the wheel below
    const wheelSeen = await this.page.evaluateHandle(() => ({
      done: new Promise<void>((resolve) => {
        window.addEventListener('wheel', () => resolve(), { once: true, passive: true })
      }),
    }))

    await this.page.mouse.wheel(0, deltaY)
    await wheelSeen.evaluate(({ done }) => done)
    await wheelSeen.dispose()
  }

  private async swipe({ x, y }: Point, deltaY: number): Promise<void> {
    const cdp = await this.page.context().newCDPSession(this.page)

    // `Input.synthesizeScrollGesture` with touch scrolls on macOS but not on the Linux CI runner
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    for (let step = 1; step <= SWIPE_STEPS; step++) {
      const fingerY = y - (deltaY * step) / SWIPE_STEPS

      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: fingerY }] })
    }
    // Pausing before release prevents a fling, which would keep moving the page into the next check
    await this.page.waitForTimeout(SWIPE_HOLD_MS)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await cdp.detach()
  }

  private getViewport(): { width: number; height: number } {
    const viewport = this.page.viewportSize()
    if (!viewport) throw new Error('RWA scroll tests need a fixed viewport')

    return viewport
  }

  private getViewportCenter(): Point {
    const { width, height } = this.getViewport()

    return { x: width / 2, y: height / 2 }
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
