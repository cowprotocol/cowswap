import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

test.describe('Market Orders', () => {
  test('[MO-01] Sell order: WETH → USDC @smoke', async ({ swapPage, wallet, mocks, confirmModal }) => {
    mocks.cowOrderApi.expectPostOrderOnce({ status: 'open' })

    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await swapPage.waitForQuote()
    await swapPage.enterSellAmount('0.5')
    await expect(swapPage.outputAmount).not.toHaveValue('')
    await swapPage.clickSwap()
    await expect(confirmModal.confirmButton).toContainText(/confirm swap/i)
  })
})
