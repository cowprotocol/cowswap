import type { Hex } from 'viem'

import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

test.describe('Network', () => {
  test('[NW-01] Switching network via the UI selector resets to the default pair for that chain @smoke', async ({
    swapPage,
    header,
  }) => {
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await expect(swapPage.sellTokenSelect).toHaveAttribute('aria-label', 'Selected token: WETH')
    await expect(swapPage.buyTokenSelect).toHaveAttribute('aria-label', 'Selected token: USDC')

    await header.switchNetwork('Sepolia', 'Gnosis')

    await expect(swapPage.page).toHaveURL(/\/#\/100\/swap/)
    await expect(swapPage.sellTokenSelect).toHaveAttribute('aria-label', 'Selected token: WXDAI')
    await expect(swapPage.buyTokenSelect).toHaveAttribute('aria-label', 'Selected token: USDC')
  })
})
