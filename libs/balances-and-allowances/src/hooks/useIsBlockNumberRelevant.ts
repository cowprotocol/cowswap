import { usePrevious } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function useIsBlockNumberRelevant(chainId: SupportedChainId, blockNumber: number | undefined): boolean {
  const prevBlockNumber = usePrevious(blockNumber)
  const prevChainId = usePrevious(chainId)
  const isChainChanged = prevChainId !== chainId

  return isChainChanged || getIsBlockNumberRelevant({ prevBlockNumber, blockNumber })
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
