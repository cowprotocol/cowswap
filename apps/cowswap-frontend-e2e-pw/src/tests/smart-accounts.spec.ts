import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.describe('Smart Accounts', () => {
  test('[SA-01] MetaMask Smart Account treated as EOA @smoke', async ({ swapPage, wallet }) => {
    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await expect(swapPage.swapButton).toBeVisible()
  })
  test(
    '[SA-02] MetaMask Smart Account: off-chain order signing works (EIP-712)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[SA-03] MetaMask Smart Account: gasless permit available — same as EOA',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[SA-04] MetaMask Smart Account: ETH-flow accessible',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    "[SA-05] MetaMask Smart Account: TWAP tab shows 'create Safe' prompt",
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SA-06] MetaMask Smart Account: TX deadline max = 180 min (EOA limit)',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SA-07] Base Smart Account: detected as SC wallet in CoW Swap',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SA-08] Base Smart Account: ETH requires wrap-WETH flow',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SA-09] Base Smart Account: gasless permit NOT available',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SA-10] Base Smart Account: bundling (Approve+Swap) supported',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SA-11] Base Smart Account: TX deadline max = 720 min (SC wallet limit)',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
  test(
    '[SA-12] Base Smart Account: TWAP availability',
    { annotation: { type: 'manual', description: 'requires real wallet or environment per spec §6.4' } },
    async () => {
      test.skip()
    },
  )
})
