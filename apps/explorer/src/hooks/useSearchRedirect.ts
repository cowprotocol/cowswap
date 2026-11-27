import { CHAIN_INFO } from '@cowprotocol/common-const'

import { getChainsForOrderId } from 'utils'

import { useOrderByNetwork } from './useOperatorOrder'

interface SearchRedirect {
  path: string | null
  isLoading: boolean
}

/**
 * Resolves a search that the current chain could not answer.
 *
 * A Solana uid is the same shape as an EVM transaction hash, so on an EVM chain a search for one
 * goes to the transaction page and lands here once no orders turn up.
 */
export function useSearchRedirect(searchString: string): SearchRedirect {
  const [candidateChain] = getChainsForOrderId(searchString)
  const { order, isLoading, errorOrderPresentInNetworkId } = useOrderByNetwork(searchString, candidateChain ?? null)
  const foundOnChain = order ? candidateChain : errorOrderPresentInNetworkId

  if (!foundOnChain) {
    return { path: null, isLoading }
  }

  const prefix = CHAIN_INFO[foundOnChain].urlAlias

  return { path: `${prefix ? `/${prefix}` : ''}/orders/${searchString}`, isLoading }
}
