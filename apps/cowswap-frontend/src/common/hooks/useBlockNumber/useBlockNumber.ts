import { useContext } from 'react'

import { useLingui } from '@lingui/react/macro'

import { BlockNumberContext, MISSING_PROVIDER } from './context'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useBlockNumberContext() {
  const blockNumber = useContext(BlockNumberContext)
  const { t } = useLingui()

  if (blockNumber === MISSING_PROVIDER) {
    throw new Error(t`BlockNumber hooks must be wrapped in a` + ` <BlockNumberProvider>`)
  }
  return blockNumber
}

/** Requires that BlockUpdater be installed in the DOM tree. */
export function useBlockNumber(): number | undefined {
  return useBlockNumberContext().value
}
