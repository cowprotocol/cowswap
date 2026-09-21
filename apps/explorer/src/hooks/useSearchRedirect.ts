import { CHAIN_INFO } from '@cowprotocol/common-const'
import { isSolanaAddress, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getChainsForOrderId, isAnAddressAccount } from 'utils'

import { useOrderByNetwork } from './useOperatorOrder'

interface SearchRedirect {
  path: string | null
  isLoading: boolean
}

const SOLANA_PREFIX = CHAIN_INFO[SupportedChainId.SOLANA].urlAlias

/**
 * Resolves a search that the current chain could not answer.
 *
 * A Solana uid is the same shape as an EVM transaction hash, so on an EVM chain a search for one
 * goes to the transaction page and lands here once no orders turn up. Addresses reach here whenever
 * their format belongs to a different chain family than the one selected.
 */
export function useSearchRedirect(searchString: string): SearchRedirect {
  const addressPath = getAddressPath(searchString)
  const [candidateChain] = getChainsForOrderId(searchString)
  // An address needs no lookup, so the order request is skipped by passing no chain.
  const { order, isLoading, errorOrderPresentInNetworkId } = useOrderByNetwork(
    searchString,
    addressPath ? null : (candidateChain ?? null),
  )

  if (addressPath) {
    return { path: addressPath, isLoading: false }
  }

  const foundOnChain = order ? candidateChain : errorOrderPresentInNetworkId

  if (!foundOnChain) {
    return { path: null, isLoading }
  }

  const prefix = CHAIN_INFO[foundOnChain].urlAlias

  return { path: `${prefix ? `/${prefix}` : ''}/orders/${searchString}`, isLoading }
}

/**
 * Address formats do not overlap between chain families, so the chain a search string belongs to
 * follows from the string itself and the search can cross families without a lookup.
 */
function getAddressPath(searchString: string): string | null {
  if (isSolanaAddress(searchString)) {
    return `/${SOLANA_PREFIX}/address/${searchString}`
  }

  // No prefix means mainnet, where an EVM address search lands when no chain is selected.
  if (isAnAddressAccount(searchString)) {
    return `/address/${searchString}`
  }

  return null
}
