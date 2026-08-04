import type { Hex } from 'viem'

import { test, expect } from '../fixtures/mockWallet'
import { CHAIN_IDS } from '../support/constants'

const CHAIN_ID = CHAIN_IDS.SEPOLIA

// Connected wallet is a viem account from INTEGRATION_TEST_PRIVATE_KEY (mock wallet, no MetaMask extension).
test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

test.describe('Limit Orders', () => {
  test('[LO-01] Place sell limit order: WETH → USDC @smoke', async ({
    setupTestConditions,
    limitPage,
    confirmModal,
  }) => {
    await setupTestConditions({
      chainId: CHAIN_ID,
      tradeType: 'limitOrder',
      sellToken: 'WETH',
      buyToken: 'USDC',
      sellAmount: '0.5',
      balances: { WETH: '1', USDC: '0' },
      allowances: { WETH: '10' },
    })
    await limitPage.setLimitPrice('2000')
    await limitPage.placeOrderButton.click()
    await expect(confirmModal.confirmButton).toContainText('Place limit order')
  })
})
