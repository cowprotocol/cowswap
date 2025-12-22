import { useContext } from 'react'

import { BlockNumberContext, MISSING_PROVIDER } from './context'

export function useBlockNumber(): number | undefined {
  const blockNumber = useContext(BlockNumberContext)

  if (blockNumber === MISSING_PROVIDER) {
    throw new Error('BlockNumber hooks must be wrapped in a <BlockNumberProvider>')
  }

  return blockNumber.value
}
