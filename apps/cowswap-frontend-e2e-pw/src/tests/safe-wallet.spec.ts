import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.describe('Safe Wallet', () => {
  test('[SW-01] Safe App: auto-connection (mocked iframe) @smoke', async ({ swapPage, wallet, mocks, page }) => {
    await mocks.safeSdk.enable({
      chainId: CHAIN_IDS.SEPOLIA,
      safeAddress: '0x1234567890123456789012345678901234567890',
    })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await expect(page.getByText(/0x1234/i)).toBeVisible()
    void wallet // fixture intentionally instantiated; no extra connect happens here
  })
})
