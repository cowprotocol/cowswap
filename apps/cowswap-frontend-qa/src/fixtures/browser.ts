import type { Page } from '@playwright/test'

const blockedUrlPatterns = [
  /googletagmanager\.com/i,
  /google-analytics\.com/i,
  /doubleclick\.net/i,
  /ads-twitter\.com/i,
  /clarity\.ms/i,
  /telegram\.org/i,
  /launchdarkly/i,
] as const

export async function setupBrowser(page: Page): Promise<void> {
  await page.context().clearCookies()

  await page.route('**/*', (route) => {
    const requestUrl = route.request().url()

    if (blockedUrlPatterns.some((pattern) => pattern.test(requestUrl))) {
      return route.abort()
    }

    return route.continue()
  })

  await page.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()

    const ownDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'serviceWorker')

    if (ownDescriptor?.configurable !== false) {
      Object.defineProperty(window.navigator, 'serviceWorker', {
        configurable: true,
        get: () => undefined,
      })
      return
    }

    const navigatorPrototype = Object.getPrototypeOf(window.navigator) as Navigator
    const prototypeDescriptor = Object.getOwnPropertyDescriptor(navigatorPrototype, 'serviceWorker')

    if (prototypeDescriptor?.configurable !== false) {
      Object.defineProperty(navigatorPrototype, 'serviceWorker', {
        configurable: true,
        get: () => undefined,
      })
    }
  })
}
