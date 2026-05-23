import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

test.describe('TWAP Orders', () => {
  test('[TW-01] Place TWAP order via Safe (mocked SDK) @smoke', async ({ twapPage, wallet, mocks }) => {
    await mocks.safeSdk.enable({
      chainId: CHAIN_IDS.SEPOLIA,
      safeAddress: '0x1234567890123456789012345678901234567890',
    })
    mocks.cowOrderApi.expectPostOrderOnce({ status: 'open' })

    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await twapPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await twapPage.partsInput.fill('5')
    await twapPage.durationInput.fill('60')
    await expect(twapPage.placeOrderButton).toBeVisible()
  })
})
