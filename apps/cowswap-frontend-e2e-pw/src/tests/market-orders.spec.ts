import type { Hex } from 'viem'

import { test, expect } from '../fixtures/mockWallet'
import { CHAIN_IDS } from '../support/constants'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

test.describe('Market Orders', () => {
  test('[MO-01] Sell order: WETH → USDC @smoke', async ({ swapPage, confirmModal }) => {
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await swapPage.waitForQuote()
    await swapPage.enterSellAmount('0.5')
    await expect(swapPage.outputAmount).not.toHaveValue('')
    await swapPage.clickSwap()
    await expect(confirmModal.confirmButton).toContainText(/confirm swap/i)
  })

  test('[MO-02] Sufficient allowance: proceeds straight to confirm swap', async ({
    swapPage,
    wallet,
    confirmModal,
    mocks,
  }) => {
    mocks.allowances.set(wallet.address, CHAIN_IDS.SEPOLIA, { [WETH]: '10000000000000000000' })

    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await swapPage.waitForQuote()
    await swapPage.enterSellAmount('0.5')
    await expect(swapPage.outputAmount).not.toHaveValue('')

    await expect(swapPage.swapButton).not.toContainText(/approve/i)
    await swapPage.clickSwap()
    await expect(confirmModal.confirmButton).toContainText(/confirm swap/i)
  })

  test('[MO-03] Insufficient allowance: asks for approval', async ({ swapPage, wallet, mocks }) => {
    mocks.allowances.set(wallet.address, CHAIN_IDS.SEPOLIA, { [WETH]: '0' })

    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await swapPage.waitForQuote()
    await swapPage.enterSellAmount('0.5')

    await expect(swapPage.approveButton).toContainText(/approve/i)
  })
})
