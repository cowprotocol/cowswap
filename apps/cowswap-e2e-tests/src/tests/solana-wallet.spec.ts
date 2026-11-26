import type { Hex } from 'viem'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { test, expect } from '../fixtures/mockSolanaWallet'

// Derived from the seed 1..32 — public knowledge, never funded, same convention as the EVM anvil key.
const TEST_SOLANA_SECRET_KEY =
  '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,121,181,86,46,143,230,84,249,64,120,177,18,232,169,139,167,144,31,133,58,230,149,190,215,224,227,145,11,173,4,150,100]'
const TEST_SOLANA_ADDRESS = '9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj'

test.use({
  mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined,
  mockWalletAutoConnect: false,
  solanaWalletSecretKey: TEST_SOLANA_SECRET_KEY,
})

test.describe('Solana mock wallet', () => {
  test.describe('without reconnect seeding', () => {
    test.use({ solanaWalletAutoConnect: false })

    test('[SOL-01] The registered Wallet Standard wallet connects and reports its account @smoke', async ({
      solanaWallet,
      page,
    }) => {
      await page.goto(`/#/${SupportedChainId.SOLANA}/swap`, { waitUntil: 'domcontentloaded' })

      await solanaWallet.connectViaModal()

      expect(solanaWallet.address).toBe(TEST_SOLANA_ADDRESS)
      await expect(page.locator('#web3-status-connected')).toContainText(TEST_SOLANA_ADDRESS.slice(0, 4))
    })
  })

  test.describe('with reconnect seeding', () => {
    test.use({ solanaWalletAutoConnect: true })

    test('[SOL-02] The wallet comes back on load without touching the modal', async ({ solanaWallet, page }) => {
      await page.goto(`/#/${SupportedChainId.SOLANA}/swap`, { waitUntil: 'domcontentloaded' })

      await expect(page.locator('#web3-status-connected')).toContainText(solanaWallet.address.slice(0, 4))
    })
  })
})
