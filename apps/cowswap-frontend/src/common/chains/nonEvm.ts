export const BITCOIN_CHAIN_ID = 1_000_000_001
export const SOLANA_CHAIN_ID = 1_000_000_002

export type NonEvmChainId = typeof BITCOIN_CHAIN_ID | typeof SOLANA_CHAIN_ID
export type ChainType = 'evm' | 'bitcoin' | 'solana'

const NON_EVM_CHAIN_IDS = new Set<number>([BITCOIN_CHAIN_ID, SOLANA_CHAIN_ID])
const BUY_ONLY_CHAIN_IDS = new Set<number>([BITCOIN_CHAIN_ID, SOLANA_CHAIN_ID])

export const NON_EVM_SELL_DISABLED_REASON = 'Swap from Bitcoin/Solana not supported.'
export const NON_EVM_FLIP_DISABLED_REASON = 'BTC/SOL is buy-only'

export function isNonEvmChainId(chainId: number | undefined | null): chainId is NonEvmChainId {
  return typeof chainId === 'number' && NON_EVM_CHAIN_IDS.has(chainId)
}

export function isBuyOnlyChainId(chainId: number | undefined | null): boolean {
  return typeof chainId === 'number' && BUY_ONLY_CHAIN_IDS.has(chainId)
}

export function getChainType(chainId: number | undefined | null): ChainType {
  if (chainId === BITCOIN_CHAIN_ID) return 'bitcoin'
  if (chainId === SOLANA_CHAIN_ID) return 'solana'

  return 'evm'
}

export function getNonEvmChainLabel(chainId: number): string | undefined {
  if (chainId === BITCOIN_CHAIN_ID) return 'Bitcoin'
  if (chainId === SOLANA_CHAIN_ID) return 'Solana'

  return undefined
}

export function getSellSideDisabledReason(chainId: number): string | undefined {
  if (!isBuyOnlyChainId(chainId)) return undefined

  const label = getNonEvmChainLabel(chainId)
  return label ? `Swap from ${label} not supported.` : NON_EVM_SELL_DISABLED_REASON
}
