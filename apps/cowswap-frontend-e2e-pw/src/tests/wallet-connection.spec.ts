import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.describe('Wallet Connection', () => {
  test('[WC-01] Connect MetaMask wallet @smoke', async ({ wallet, page }) => {
    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await expect(page.getByText(wallet.address.slice(0, 6), { exact: false })).toBeVisible()
  })
  test(
    '[WC-02] Connect WalletConnect',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[WC-03] Connect Rabby wallet',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[WC-04] Connect hardware wallet via MetaMask',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[WC-05] Switch network while connected',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[WC-06] Disconnect wallet',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[WC-07] Session persistence on page reload',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[WC-08] Connect via mobile app (in-app browser)',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[WC-09] Connect via mobile app — WalletConnect fallback',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    "[WC-10] Connect inside wallet's built-in browser (injected provider detection)",
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[WC-11] Connect Safe via WalletConnect (external signer)',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[WC-12] Open CoW Swap inside Safe App (native Safe App integration)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[WC-13] Multiple tabs — connection state isolation',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[WC-14] Multiple tabs — no duplicate connection prompts',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[WC-15] Account modal: connected wallet address displayed correctly',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[WC-16] Account modal:  history shows last 10 orders',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[WC-17] Account modal: network switch updates displayed data',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
})
