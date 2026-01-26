import { ChainInfo } from '@cowprotocol/cow-sdk'

export function filterChainsByQuery(chains: ChainInfo[], normalizedChainQuery: string): ChainInfo[] {
  if (!chains.length || !normalizedChainQuery) {
    return chains
  }

  return chains.filter((chain) => {
    const labelMatch = chain.label.toLowerCase().includes(normalizedChainQuery)
    const idMatch = String(chain.id).includes(normalizedChainQuery)

    return labelMatch || idMatch
  })
}

interface EmptyStateFlagsParams {
  filteredChainsLength: number
  isLoading: boolean
  normalizedChainQuery: string
  totalChains: number
}

export interface EmptyStateFlags {
  showSearchEmptyState: boolean
  showUnavailableState: boolean
}

export function getEmptyStateFlags({
  filteredChainsLength,
  isLoading,
  normalizedChainQuery,
  totalChains,
}: EmptyStateFlagsParams): EmptyStateFlags {
  const hasQuery = Boolean(normalizedChainQuery)

  return {
    showUnavailableState: !isLoading && totalChains === 0 && !hasQuery,
    showSearchEmptyState: !isLoading && filteredChainsLength === 0 && hasQuery,
  }
}
