import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

test.describe('Limit Orders', () => {
  test('[LO-01] Place sell limit order: WETH → USDC @smoke', async ({ limitPage, wallet, mocks, confirmModal }) => {
    mocks.cowOrderApi.expectPostOrderOnce({ status: 'open' })

    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await limitPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await limitPage.inputAmount.fill('0.5')
    await limitPage.setLimitPrice('2000')
    await limitPage.placeOrderButton.click()
    await expect(confirmModal.confirmButton).toContainText(/(place|confirm) order/i)
  })
})
