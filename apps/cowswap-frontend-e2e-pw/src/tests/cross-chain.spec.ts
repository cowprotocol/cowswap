import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.describe('Cross-Chain Swaps', () => {
  test('[CC-01] Cross-chain swap UI: accessible via Swap form @smoke', async ({ swapPage, wallet, mocks }) => {
    mocks.bungee.stubRoute({ sellAmount: '1000000', buyAmount: '999000', estTimeSec: 180 })
    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await expect(swapPage.page.getByText(/bridge|cross-chain/i).first()).toBeVisible()
  })
  test(
    '[CC-02] Cross-chain swap: Near provider',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-03] Cross-chain swap:Bungee provider',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-04] Cross-chain: recipient address — defaults to connected wallet',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-05] Cross-chain: custom recipient address — valid address accepted',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-06] Cross-chain: recipient address — invalid address rejected',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-07] Cross-chain: recipient address — wrong chain prefix warning',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-08] Cross-chain: confirm modal shows recipient address prominently',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-09] Cross-chain: bridge provider shown in UI',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-10] Cross-chain: status tracking after submission',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-11] Cross-chain: unsupported chain pair shows clear error',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-12] Cross-chain: estimated fees and time shown before confirmation',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-13] Cross-chain: single provider selected automatically — best price shown',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-14] Cross-chain: provider quote updates when amount changes',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-15] Cross-chain: ETH-flow source — native ETH sent cross-chain',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-16] Cross-chain: ETH-flow source — SC wallet must wrap ETH first',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-17] Cross-chain: swap to Solana — SOL or SPL token as destination',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-18] Cross-chain: Solana recipient — invalid base58 address rejected',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-19] Cross-chain: swap to Bitcoin — BTC as destination',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-20] Cross-chain: Bitcoin recipient — invalid address rejected',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-21] Cross-chain: recipient warning for SC wallet or a smart wallet (base)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-22] Cross-chain: non-EVM destination recipient — format guidance shown',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-23] Cross-chain: price impact > 10% on swap step — confirm price modal shown',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-24] Cross-chain: price impact >=5% on swap step - acknowledgement modal shown',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-25] Cross-chain: sell/buy amounts and USD estimations correct for tokens with different decimal precision',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-26] Cross-chain: 0-decimal token as source (MPS on Gnosis Chain) — amounts and USD estimation',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-28] Cross-chain: Bungee - Account Proxy banner shown on swap leg',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-29] Cross-chain: Near Intents - Modified recipient address banner shown on swap leg',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[CC-30] Cross-chain: calculation parity - form 'Receive (incl. fees)' equals bridge 'Expected to receive'",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[CC-31] Cross-chain: calculation parity - bridge 'Min. to deposit' equals swap 'Min. to receive'",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[CC-36] Cross-chain: BTC vs Solana destination - flow differences and shared gating',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
})
