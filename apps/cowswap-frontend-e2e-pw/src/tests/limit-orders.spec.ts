import type { Hex } from 'viem'

import { test, expect } from '../fixtures/mockWallet'
import { CHAIN_IDS } from '../support/constants'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

// Connected wallet is a viem account from E2E_ACCOUNT_PK (mock wallet, no MetaMask extension).
test.use({ mockWalletKey: process.env.E2E_ACCOUNT_PK as Hex | undefined })

test.describe('Limit Orders', () => {
  test('[LO-01] Place sell limit order: WETH → USDC @smoke', async ({ limitPage, mocks, confirmModal }) => {
    mocks.cowOrderApi.expectPostOrderOnce({ status: 'open' })

    await limitPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await limitPage.inputAmount.fill('0.5')
    await limitPage.setLimitPrice('2000')
    await limitPage.placeOrderButton.click()
    await expect(confirmModal.confirmButton).toContainText('Place limit order')
  })
  test(
    '[LO-02] Place sell limit order',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
})
