import type { AllowanceValue, AllowancesMock } from '../mocks/allowances'
import type { BalanceValue, BalancesMock } from '../mocks/balances'

export interface SeedTraderOpts {
  balances?: Record<string, BalanceValue>
  allowances?: Record<string, AllowanceValue>
}

/**
 * Sets a trader's balances/allowances directly by token address, in raw atoms.
 *
 * This is the same thing `setupTestConditions`'s own `balances`/`allowances` options do, keyed by
 * token *symbol* with human-readable amounts — but that option resolves decimals via
 * `support/tokens.ts`, which has an incorrect 6-decimal entry for this Sepolia deployment's fake
 * USDC (it actually reports 18 on-chain). Whenever USDC is involved, seed here with
 * `parseUnits(amount, 18)` instead of through `setupTestConditions`.
 */
export function seedTrader(
  mocks: { balances: BalancesMock; allowances: AllowancesMock },
  wallet: { address: string },
  chainId: number,
  opts: SeedTraderOpts,
): void {
  if (opts.balances) mocks.balances.set(wallet.address, chainId, opts.balances)
  if (opts.allowances) mocks.allowances.set(wallet.address, chainId, opts.allowances)
}
