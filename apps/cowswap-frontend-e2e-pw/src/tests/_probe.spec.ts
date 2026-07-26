import type { Hex } from 'viem'

import { test, expect } from '../fixtures/mockWallet'
import { CHAIN_IDS } from '../support/constants'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

test.use({ mockWalletKey: process.env.E2E_ACCOUNT_PK as Hex | undefined })

test('PROBE: limit button when connected + filled', async ({ limitPage, mocks, page }) => {
  mocks.cowOrderApi.expectPostOrderOnce({ status: 'open' })
  await limitPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
  await limitPage.inputAmount.fill('0.5')
  await limitPage.setLimitPrice('2000')
  await page.waitForTimeout(2500)
  const buttons = await page.locator('#trade-container button, [id*="trade"] button, button').allInnerTexts()
  console.log('=== BUTTONS: ' + JSON.stringify([...new Set(buttons)].filter(Boolean)) + ' ===')
  expect(true).toBe(true)
})
