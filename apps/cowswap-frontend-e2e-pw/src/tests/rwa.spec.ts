import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

const ONDO_USDY = '0x96f6ef951840721adbf46ac996b59e0235cb985c'

test.describe('RWA (Ondo & xStocks)', () => {
  test('[RW-01] Ondo & xStocks available on Mainnet @smoke', async ({ swapPage, wallet, mocks }) => {
    mocks.tokenLists.setListForChain(CHAIN_IDS.MAINNET, {
      tokens: [
        { address: ONDO_USDY, symbol: 'USDY', name: 'Ondo USDY', decimals: 18, chainId: 1 },
        {
          address: '0x0000000000000000000000000000000000000001',
          symbol: 'AAPLx',
          name: 'Backed Apple',
          decimals: 18,
          chainId: 1,
        },
      ],
    })

    await wallet.connectAsEOA({ chainId: CHAIN_IDS.MAINNET })
    await swapPage.goto({ chainId: CHAIN_IDS.MAINNET })
    await swapPage.tokens.openOutput()
    await swapPage.tokens.searchAndPick('USDY')
    await expect(swapPage.page.getByText('USDY')).toBeVisible()
  })
  test(
    '[RW-02] RWA token availability — BNB Smart Chain (chainId 56) lists Ondo + xStocks',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-03] RWA token availability — Arbitrum (chainId 42161) lists xStocks only (no Ondo)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-04] RWA token availability — Ink (chainId 57073) lists xStocks only',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-05] RWA tokens NOT available on Gnosis/Polygon/Base/Avalanche/Plasma/Linea/Sepolia',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-06] Geo restriction — user country in blocked list cannot trade RWA token',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-07] Geo restriction — blocked list coverage: US, Canada, China, Russia, all EU/EEA, sanctioned states',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-08] Geo allowed — user country NOT in blocked list can trade without consent modal',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-09] Consent modal — appears when geo country is unknown (VPN / privacy / API failure)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-10] Consent — confirmed consent persists per wallet + consentHash (localStorage)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[RW-11] Consent — 'Cancel' dismisses modal and blocks the trade",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-12] Consent — consentHash change invalidates previous consent (terms update flow)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-13] Validation — Swap form blocks xStocks trade below $10 USD minimum',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-14] Validation — TWAP form blocks xStocks trade below $10 per PART',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-15] Min trade — Ondo tokens are NOT subject to the $10 minimum',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-16] Trading hours — xStocks trades outside US market hours: no UI block, solver/quote behavior',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-17] Trading hours —Ondo - weekends',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-18] Mixed pair — only one side is RWA still triggers RWA checks',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[RW-19] Token import — importing a custom RWA token triggers consent / restriction check',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
})
