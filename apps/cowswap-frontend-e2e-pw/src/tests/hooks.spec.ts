import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.describe('Hooks', () => {
  test('[HK-01] Enable Hooks via settings toggle @smoke', async ({ swapPage, wallet, page }) => {
    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await page.getByRole('button', { name: /settings/i }).click()
    await page.getByRole('checkbox', { name: /hooks/i }).check()
    await expect(page.getByText(/hooks/i)).toBeVisible()
  })
})
