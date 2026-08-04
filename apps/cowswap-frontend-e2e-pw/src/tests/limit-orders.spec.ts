import type { Hex } from 'viem'

import { test, expect } from '../fixtures/mockWallet'
import { CHAIN_IDS } from '../support/constants'

const CHAIN_ID = CHAIN_IDS.SEPOLIA

const DEFAULT_WETH_BALANCE = 1_000_000_000_000_000_000n // 1 WETH
const DEFAULT_USDC_BALANCE = 0n

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

// Connected wallet is a viem account from INTEGRATION_TEST_PRIVATE_KEY (mock wallet, no MetaMask extension).
test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

test.describe('Limit Orders', () => {
  test.beforeEach(async ({ wallet, mocks }) => {
    mocks.balances.set(wallet.address, CHAIN_ID, {
      [WETH]: DEFAULT_WETH_BALANCE.toString(),
      [USDC]: DEFAULT_USDC_BALANCE.toString(),
    })
    mocks.allowances.set(wallet.address, CHAIN_ID, { [WETH]: '10000000000000000000' })
  })

  test('[LO-01] Place sell limit order: WETH → USDC @smoke', async ({ limitPage, confirmModal }) => {
    await limitPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await limitPage.inputAmount.fill('0.5')
    await limitPage.setLimitPrice('2000')
    await limitPage.placeOrderButton.click()
    await expect(confirmModal.confirmButton).toContainText('Place limit order')
  })
})
