import { parseUnits } from 'viem'

import type { Locator } from '@playwright/test'

/**
 * Reads a descendant `[title]` element's exact-precision `"<amount> <symbol>"` string (the
 * `TokenAmount`/`FiatAmount` convention this suite's page objects already rely on, e.g.
 * `sellBalance`/`buyBalance`) and parses the amount into raw atoms.
 *
 * `decimals` defaults to 18: both Sepolia test tokens in this suite (WETH and the fake "USDC")
 * report 18 decimals on-chain, not USDC's real-world 6 — see `support/tokens.ts`'s known-wrong
 * entry.
 */
export async function readTitledAmount(container: Locator, decimals = 18): Promise<bigint> {
  const title = await container.locator('[title]').getAttribute('title')
  const [value] = (title ?? '').split(' ')
  return parseUnits(value, decimals)
}
