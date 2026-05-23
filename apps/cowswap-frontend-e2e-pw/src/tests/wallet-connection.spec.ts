import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.describe('Wallet Connection', () => {
  test('[WC-01] Connect MetaMask wallet @smoke', async ({ wallet, page }) => {
    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await expect(page.getByText(wallet.address.slice(0, 6), { exact: false })).toBeVisible()
  })
})
