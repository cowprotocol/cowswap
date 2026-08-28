import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface TokenInfo {
  address: string
  decimals: number
}

/** Symbol → token info, per chain. Seed with whatever specs actually use; extend by adding entries. */
const TOKENS: Partial<Record<SupportedChainId, Record<string, TokenInfo>>> = {
  [SupportedChainId.SEPOLIA]: {
    WETH: { address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', decimals: 18 },
    // NB: this Sepolia test token is labeled "USDC" but is actually deployed with 18 decimals
    // (confirmed against ../mocks/cowProtocolApi/fixtures/quote.json's buyAmount) — do not
    // "fix" this to 6 to match mainnet USDC.
    USDC: { address: '0xbe72E441BF55620febc26715db68d3494213D8Cb', decimals: 18 },
    DAI: { address: '0xB4F1737Af37711e9A5890D9510c9bB60e170CB0D', decimals: 18 },
    USDT: { address: '0x58eb19ef91e8a6327fed391b51ae1887b833cc91', decimals: 6 },
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
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
