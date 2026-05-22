import { usePrevious } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Skip results from outdated fetches if there is a result from a newer one.
 * Uses dataUpdatedAt from React Query (equivalent to blockNumber from multicall on develop).
 */
export function useIsBlockNumberRelevant(chainId: SupportedChainId, dataUpdatedAt: number): boolean {
  const prevDataUpdatedAt = usePrevious(dataUpdatedAt)
  const prevChainId = usePrevious(chainId)
  const isChainChanged = prevChainId !== chainId

  return isChainChanged || getIsBlockNumberRelevant({ prevBlockNumber: prevDataUpdatedAt, blockNumber: dataUpdatedAt })
}

function getIsBlockNumberRelevant<T = number | undefined>({
  blockNumber,
  prevBlockNumber,
}: {
  blockNumber: T
  prevBlockNumber: T
}): boolean {
  return typeof prevBlockNumber === 'number' && typeof blockNumber === 'number' ? blockNumber > prevBlockNumber : true
}
