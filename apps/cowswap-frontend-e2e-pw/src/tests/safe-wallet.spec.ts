import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.describe('Safe Wallet', () => {
  test('[SW-01] Safe App: auto-connection (mocked iframe) @smoke', async ({ swapPage, wallet, mocks, page }) => {
    await mocks.safeSdk.enable({
      chainId: CHAIN_IDS.SEPOLIA,
      safeAddress: '0x1234567890123456789012345678901234567890',
    })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await expect(page.getByText(/0x1234/i)).toBeVisible()
    void wallet // fixture intentionally instantiated; no extra connect happens here
  })
  test(
    '[SW-02] Safe App: order signing routes through Safe tx queue',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[SW-03] Safe via WalletConnect — desktop Safe app (app.safe.global)',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-04] Safe via WalletConnect — mobile Safe app',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-05] Safe imported in Rabby wallet — connection and signing',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-06] Fee: Safe App License Fee (0.1%) applied inside Safe App',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-07] Fee: Safe App License Fee NOT applied via WalletConnect',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    "[SW-08] Fee: SC wallet — no gasless transactions, '+gas' shown in Network costs",
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-09] Fee: Safe App fee exempt for correlated token pairs',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    "[SW-10] Bundling: Safe App — 'Approve + Swap' in single Safe TX",
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-11] Bundling: WC-connected Safe — separate approval TX required',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-12] Bundling: Rabby + Safe — verify whether bundling is supported',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-13] TX deadline: Safe SC wallet max deadline = 720 min',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-14] ETH-flow: bundling',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-15] ETH-flow: Safe uses wrap-WETH instead of native ETH-flow',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SW-16] TWAP: requires Safe with ExtensibleFallbackHandler not  installed',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
})
