import { CHAIN_IDS, type SupportedChainId } from './constants'

export interface TokenInfo {
  address: string
  decimals: number
}

/** Symbol → token info, per chain. Seed with whatever specs actually use; extend by adding entries. */
const TOKENS: Partial<Record<SupportedChainId, Record<string, TokenInfo>>> = {
  [CHAIN_IDS.SEPOLIA]: {
    WETH: { address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', decimals: 18 },
    USDC: { address: '0xbe72E441BF55620febc26715db68d3494213D8Cb', decimals: 6 },
  },
  [CHAIN_IDS.GNOSIS]: {
    WXDAI: { address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', decimals: 18 },
    USDC: { address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', decimals: 6 },
  },
}

export function resolveToken(chainId: SupportedChainId, symbol: string): TokenInfo {
  const byChain = TOKENS[chainId]
  if (!byChain) {
    throw new Error(`tokens.ts: no tokens registered for chain ${chainId}`)
  }

  const token = byChain[symbol]
  if (!token) {
    const known = Object.keys(byChain).join(', ')
    throw new Error(`tokens.ts: unknown token symbol "${symbol}" for chain ${chainId} — known symbols: ${known}`)
  }

  return token
}
