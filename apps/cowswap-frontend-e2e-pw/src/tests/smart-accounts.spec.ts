import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.describe('Smart Accounts', () => {
  test('[SA-01] MetaMask Smart Account treated as EOA @smoke', async ({ swapPage, wallet }) => {
    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await expect(swapPage.swapButton).toBeVisible()
  })
})
