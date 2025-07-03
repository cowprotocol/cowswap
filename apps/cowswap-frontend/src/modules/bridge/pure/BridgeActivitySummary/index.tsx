import { ReactNode } from 'react'

import { BridgeStepRow } from './BridgeStepRow'
import { BridgeSummaryHeader } from './BridgeSummaryHeader'
import { SwapStepRow } from './SwapStepRow'

import { SwapAndBridgeContext } from '../../types'

interface BridgeActivitySummaryProps {
  context: SwapAndBridgeContext
  children: ReactNode
}

export function BridgeActivitySummary(props: BridgeActivitySummaryProps): ReactNode {
  const { context, children } = props

  return (
    <>
      <BridgeSummaryHeader context={context} />

      <SwapStepRow context={context} />

      <BridgeStepRow context={context} />

      {children}
    </>
  )
}
