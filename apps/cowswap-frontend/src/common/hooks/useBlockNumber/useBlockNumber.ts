import { useContext } from 'react'

import { BlockNumberContext } from './context'

export function useBlockNumber(): number | undefined {
  const blockNumber = useContext(BlockNumberContext)

  if (blockNumber === BlockNumberContext.MISSING_PROVIDER) {
    throw new Error('BlockNumber hooks must be wrapped in a <BlockNumberProvider>')
  }

  return blockNumber.value
}
