import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'

test.describe('Market Orders', () => {
  test('[MO-01] Sell order: WETH → USDC @smoke', async ({ swapPage, wallet, mocks, confirmModal }) => {
    mocks.cowOrderApi.expectPostOrderOnce({ status: 'open' })

    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA, sell: WETH, buy: USDC })
    await swapPage.waitForQuote()
    await swapPage.enterSellAmount('0.5')
    await expect(swapPage.outputAmount).not.toHaveValue('')
    await swapPage.clickSwap()
    await expect(confirmModal.confirmButton).toContainText(/confirm swap/i)
  })
  test(
    '[MO-02] Sell order: ERC-20 → ERC-20',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-03] Buy order: specify exact buy amount (ERC-20)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-04] Buy order: approval amount includes slippage buffer',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-05] Buy order: ETH as sell token (ETH-flow buy not supported)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-06] Swap form: To field amount calculation',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[MO-07] Swap form: 'Receive (incl. costs)' field calculation",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[MO-08] Swap form: 'Minimum receive' calculation in Confirm modal",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-09] Swap form: MAX button deducts 0.01 ETH for gas',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-10] Confirm modal: price update banner',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-11] ETH-flow: place ETH sell order (EOA wallet)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-12] ETH-flow: SC wallet falls back to wrap-WETH flow',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-13] ETH-flow: SC wallet: Safe+bundling',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-14] ETH-flow: order status lifecycle',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-15] ETH-flow: order submission TX fails',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-16] ETH-flow: cancel order (on-chain cancellation)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-17] ETH-flow: order expired — ETH refunded',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-18] TX deadline: default value and limits (regular flow)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-19] TX deadline: ETH-flow specific limits',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-20] TX deadline: order expires after set deadline',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-21] TX deadline: inactive tab quote expiry message',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-22] Slippage: dynamic mode defaults and range (regular flow)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-23] Slippage: manual mode — warnings at thresholds',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-24] Slippage: ETH-flow defaults and limits',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-25] Custom recipient: send swap output to different address',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-26] Custom recipient: field validation — invalid address',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-27] Custom recipient: cross-chain prefix warning',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-28] Custom recipient: ENS name resolution',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-29] Insufficient balance: error on swap form and unfillable label in Account modal',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-30] Token not approved (non-permittable, no bundling): approval button shown, order unfillable in Account modal',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-31] Token not approved — bundling supported: Approve+Swap button shown',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[MO-32] Fee ≥ 30% of sell amount: red banner with 'Swap anyways' checkbox",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-33] Fee ≥ 20% orange banner, fee ≥ 10% yellow banner',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-34] Sell amount too small to cover min fee: error shown',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-35] TWAP suggestion banner for large high-impact orders',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-36] Error: no liquidity / token not supported',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-37] Error: price impact ≥ 5% — confirm price modal',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[MO-38] Error: price impact > 10% — type 'Confirm' to proceed",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-39] Error: impossible to calculate price impact',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-40] Error: offline state',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-41] Error: unsupported network',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-42] Token approval: first-time ERC-20 approval',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-43] Token approval: gasless approval (EIP-2612 permit)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-44] Quote expiry: auto-refresh and countdown timer',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-45] Order history: completed swap details correct',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-46] Not connected state: Connect Wallet button shown',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-47] Wrap ETH → WETH via swap form',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-48] Unwrap WETH → ETH via swap form',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-49] Wrap ETH → WETH: 1:1 rate, no price impact shown',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-50] Wrap: SC wallet flow (wrap inside Safe)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[MO-51] Buy order: 'From (incl. costs)' tooltip breakdown",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-52] Sell vs Buy order: switching mode recalculates amounts',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-53] Approval: full approval — unlimited allowance',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-54] Approval: partial approval — exact trade amount only',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-55] Approval: gasless permit — SC wallet falls back to on-chain approval',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-56] Approval: allowance check before each swap',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-57] Cancel market order: off-chain soft cancellation (EOA)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-58] Cancel market order: race condition — order filled before cancel',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-59] Cancel market order: SC wallet — on-chain TX cancellation',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-60] Gasless permit: UI warning — partial permit may make other open orders unfillable',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-61] Gasless partial permit: existing open swap order becomes unfillable',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-62] Gasless partial permit: existing open limit order becomes unfillable',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-63] Unfillable permit order: only on-chain approval restores fillability',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-64] Permit availability: not offered for Safe, Base Smart Account, or SC wallets',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-65] Permit availability: offered for EOA and MetaMask Smart Account',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-66] Progress bar: regular order happy path — steps 1 → 2 → 3 → 4',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-67] Progress bar: bar never regresses to Step 1 once past it',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-68] Progress bar: fast fill still shows Executing (Step 3) before Executed (Step 4)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-69] Progress bar: ETH-flow order — full lifecycle, no regression to Step 1',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[MO-70] Progress bar: temporary allowance/balance lag does not show 'Price change' / unfillable screen",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[MO-71] Progress bar: true price-change unfillable — 'Price change' screen shown correctly",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-72] Progress bar: stale delayed completion timer does not overwrite newer order state',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-73] Progress bar: bridge order — bridge step persists during reconnect/reload',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-74] Swap form: balances and USD estimations correct for tokens with different decimal precision',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-75] Swap form: 0-decimal token (MPS on Gnosis Chain) — balance, amounts, USD estimation',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-76] USDT approval: revoke-then-approve flow for market swap when existing allowance < order amount (Ethereum)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-77] USDT approval: no revoke or approve needed for market swap when existing allowance ≥ order amount',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-78] Swap form: protocol fee applied at 0.02% (2 bps) for standard token pair',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[MO-79] Swap form: protocol fee applied at 0.003% (0.3 bps) for correlated assets (stables/RWAs)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
})
