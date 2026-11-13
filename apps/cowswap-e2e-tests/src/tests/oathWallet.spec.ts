import { test, expect } from '../fixtures/mockWallet'
import { WalletConnectionPage } from '../pages/WalletConnectionPage'

test.use({ mockWalletAutoConnect: false })

test('Oath opens its QR flow directly and preserves generic WalletConnect', async ({ page }) => {
  const picker = new WalletConnectionPage(page)
  await picker.open()
  await expect(picker.oath).toBeVisible()
  await picker.oath.click()
  await expect(picker.qrCode).toBeVisible()
  await expect(picker.qrCode).toHaveAttribute('alt', 'Oath Wallet')
  await expect.poll(() => picker.hasValidQrPairing()).toBe(true)
  await expect(picker.connectionGuide).toBeVisible()

  await picker.back.click()
  await expect(picker.oath).toBeVisible()
  await picker.walletConnect.click()
  await expect(picker.qrCode).toBeVisible()
  await expect.poll(() => picker.hasValidQrPairing()).toBe(true)
  await expect(picker.connectionGuide).toBeVisible()
  await expect(picker.qrCode).not.toHaveAttribute('alt', 'Oath Wallet')
})

test.describe('iPhone browser', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
  })

  test('Oath opens its mobile screen and hands a valid pairing URI to the iOS app', async ({ page }) => {
    const picker = new WalletConnectionPage(page)
    await picker.captureMobileHandoff()
    await picker.open()
    await expect(picker.oath).toBeVisible()
    await picker.oath.click()
    await expect(picker.mobileConnection).toBeVisible()
    await expect(picker.continueInOath).toBeVisible()
    await picker.resetMobileHandoff()
    await picker.continueInOath.click()
    await expect.poll(() => picker.hasValidMobileHandoff()).toBe(true)
  })
})

test.describe('Android browser', () => {
  test.use({
    viewport: { width: 393, height: 851 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  })

  test('does not offer the iOS-only Oath handoff and preserves wallet search', async ({ page }) => {
    const picker = new WalletConnectionPage(page)
    await picker.open()
    await expect(picker.allWallets).toBeVisible()
    await expect(picker.oath).toHaveCount(0)
  })
})
