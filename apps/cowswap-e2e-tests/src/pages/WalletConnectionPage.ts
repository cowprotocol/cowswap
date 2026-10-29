import type { Locator, Page } from '@playwright/test'

export class WalletConnectionPage {
  readonly oath: Locator
  readonly walletConnect: Locator
  readonly qrCode: Locator
  readonly mobileConnection: Locator
  readonly connectionGuide: Locator
  readonly back: Locator

  constructor(private readonly page: Page) {
    this.oath = page.getByText('Oath Wallet', { exact: true })
    this.walletConnect = page.getByText('WalletConnect', { exact: true })
    this.qrCode = page.getByTestId('wui-qr-code')
    this.mobileConnection = page.locator('w3m-connecting-wc-mobile')
    this.connectionGuide = page.getByText('Scan this QR Code with your phone', { exact: true })
    this.back = page.getByTestId('header-back')
  }

  async hasValidQrPairing(): Promise<boolean> {
    return this.qrCode.evaluate((element) => /^wc:[a-f0-9]+@2\?/.test(element.getAttribute('uri') ?? ''))
  }

  async captureMobileHandoff(): Promise<void> {
    await this.page.addInitScript(() => {
      const browserWindow = window as Window & { __oathHandoffValid?: boolean }
      const originalOpen = window.open.bind(window)
      window.open = (url, target, features) => {
        const href = String(url)
        if (href.startsWith('oathwallet:')) {
          const link = new URL(href)
          const pairing = link.searchParams.get('uri') ?? ''
          browserWindow.__oathHandoffValid =
            link.protocol === 'oathwallet:' && link.host === 'wc' && /^wc:[a-f0-9]+@2\?/.test(pairing)
          return null
        }
        return originalOpen(url, target, features)
      }
    })
  }

  async hasValidMobileHandoff(): Promise<boolean> {
    return this.page.evaluate(() => Boolean((window as Window & { __oathHandoffValid?: boolean }).__oathHandoffValid))
  }

  async open(): Promise<void> {
    await this.page.goto('/#/1/swap', { waitUntil: 'domcontentloaded' })
    await this.page
      .getByRole('button', { name: /connect wallet/i })
      .first()
      .click()
  }
}
