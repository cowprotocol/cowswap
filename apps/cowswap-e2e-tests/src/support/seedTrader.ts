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
 * token *symbol* with human-readable amounts and resolved via `support/tokens.ts` (18 decimals for
 * this Sepolia deployment's fake USDC, not its real-world 6 — already correct there). Use this
 * directly instead when a test doesn't go through `setupTestConditions` at all, or needs to seed
 * by address rather than by the symbols `support/tokens.ts` knows about.
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
