import { atom } from 'jotai'

import { EVM_CHAIN_IDS, multiChainModeActiveAtom } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { defaultTokensByChainFamily } from '@cowprotocol/tokens'

export type TokensBySymbolAllChains = Record<string, Partial<Record<SupportedChainId, TokenWithLogo>>>

const EMPTY_TOKENS_BY_SYMBOL: TokensBySymbolAllChains = {}

/**
 * Groups every EVM chain's default token list by uppercased symbol, e.g.
 * `{ USDC: { 1: <token on mainnet>, 137: <token on polygon>, ... } }`.
 * Used to resolve a token's cross-chain "siblings" for the multichain
 * balances display. Gated behind `multiChainModeActiveAtom` so the default
 * lists for chains the user isn't browsing are only ever fetched while the
 * feature is actually on.
 */
export const tokensBySymbolAllChainsAtom = atom((get) => {
  if (!get(multiChainModeActiveAtom)) return EMPTY_TOKENS_BY_SYMBOL

  const result: TokensBySymbolAllChains = {}

  for (const chainId of EVM_CHAIN_IDS) {
    const tokens = get(defaultTokensByChainFamily(chainId))
    if (!tokens) continue

    for (const token of tokens) {
      if (!token.symbol) continue

      const symbolKey = token.symbol.toUpperCase()
      const group = result[symbolKey] ?? (result[symbolKey] = {})
      group[chainId] = token
    }
  }

  return result
})
