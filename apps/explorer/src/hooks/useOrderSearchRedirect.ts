import { CHAIN_INFO } from '@cowprotocol/common-const'

import { getChainsForOrderId } from 'utils'

import { useOrderByNetwork } from './useOperatorOrder'

interface OrderSearchRedirect {
  path: string | null
  isLoading: boolean
}

/**
 * A Solana uid is the same shape as an EVM transaction hash, so on an EVM chain a search for one
 * goes to the transaction page and ends up on the search page once no orders turn up. This looks
 * the id up on the chains it could actually belong to, so the search still finds it.
 */
export function useOrderSearchRedirect(searchString: string): OrderSearchRedirect {
  const [candidateChain] = getChainsForOrderId(searchString)
  const { order, isLoading, errorOrderPresentInNetworkId } = useOrderByNetwork(searchString, candidateChain ?? null)
  const foundOnChain = order ? candidateChain : errorOrderPresentInNetworkId

  if (!foundOnChain) {
    return { path: null, isLoading }
  }

  const prefix = CHAIN_INFO[foundOnChain].urlAlias

  return { path: `${prefix ? `/${prefix}` : ''}/orders/${searchString}`, isLoading }
}
