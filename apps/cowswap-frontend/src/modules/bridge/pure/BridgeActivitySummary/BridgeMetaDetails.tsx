import { ReactNode } from 'react'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

import { SwapAndBridgeContext } from '../../types'
import { RecipientDisplay } from '../RecipientDisplay'

interface BridgeMetaDetailsProps {
  context: SwapAndBridgeContext
}

export function BridgeMetaDetails({ context }: BridgeMetaDetailsProps): ReactNode {
  const {
    overview: { targetCurrency },
    quoteBridgeContext,
  } = context

  return (
    <>
      {/*TODO: add bridging execution time, we don't such a value for now*/}

      <SummaryRow>
        <b>Recipient</b>
        <i>
          {quoteBridgeContext?.recipient ? (
            <RecipientDisplay recipient={quoteBridgeContext.recipient} chainId={targetCurrency.chainId} logoSize={16} />
          ) : (
            <ShimmerWrapper />
          )}
        </i>
      </SummaryRow>
    </>
  )
}
