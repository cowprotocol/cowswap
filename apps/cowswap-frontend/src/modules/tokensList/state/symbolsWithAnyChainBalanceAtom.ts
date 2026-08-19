import { atom } from 'jotai'

import { multiChainBalancesAtom } from '@cowprotocol/balances-and-allowances'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { tokensBySymbolAllChainsAtom } from './tokensBySymbolAllChainsAtom'

const EMPTY_SYMBOLS: ReadonlySet<string> = new Set()

/**
 * Uppercased symbols that have a non-zero balance on at least one EVM chain,
 * e.g. `{ "USDC", "WETH" }`. Used to prioritize a token in the selector's
 * sort order even when the *currently browsed* chain's own balance is zero —
 * without this, switching to e.g. Base would bury a USDC held only on
 * mainnet at the bottom of the list, even though the user clearly cares
 * about that asset. Derives from `tokensBySymbolAllChainsAtom`, so it's
 * already empty (and free) whenever multichain mode is off.
 */
export const symbolsWithAnyChainBalanceAtom = atom((get): ReadonlySet<string> => {
  const tokensBySymbol = get(tokensBySymbolAllChainsAtom)
  const multiChainBalances = get(multiChainBalancesAtom)

  let result: Set<string> | undefined

  for (const [symbolKey, group] of Object.entries(tokensBySymbol)) {
    for (const entry of Object.entries(group)) {
      const chainId = Number(entry[0]) as SupportedChainId
      const token = entry[1]
      if (!token) continue

      const balance = multiChainBalances[chainId]?.[getAddressKey(token.address)]
      if (balance !== undefined && balance > 0n) {
        result ??= new Set()
        result.add(symbolKey)
        break
      }
    }
  }

  return result ?? EMPTY_SYMBOLS
})
