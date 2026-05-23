import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.describe('Cross-Chain Swaps', () => {
  test('[CC-01] Cross-chain swap UI: accessible via Swap form @smoke', async ({ swapPage, wallet, mocks }) => {
    mocks.bungee.stubRoute({ sellAmount: '1000000', buyAmount: '999000', estTimeSec: 180 })
    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await expect(swapPage.page.getByText(/bridge|cross-chain/i).first()).toBeVisible()
  })
})
