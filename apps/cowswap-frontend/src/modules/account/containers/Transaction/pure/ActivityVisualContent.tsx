import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { Currency } from '@uniswap/sdk-core'

import { CurrencyLogoPair } from 'common/pure/CurrencyLogoPair'
import { ActivityDerivedState } from 'common/types/activity'

import { BridgeOrderVisual } from './BridgeOrderVisual'

import { ActivityVisual } from '../styled'

export function ActivityVisualContent({
  isOrder,
  singleToken,
  inputToken,
  outputToken,
  isBridgeOrder,
  order,
  swapAndBridgeContext,
  swapAndBridgeOverview,
}: {
  isOrder: boolean
  singleToken: Currency | null
  inputToken: Currency | null
  outputToken: Currency | null
  isBridgeOrder: boolean
  order: ActivityDerivedState['order']
  swapAndBridgeContext: { statusResult?: unknown } | undefined
  swapAndBridgeOverview: { targetCurrency?: Currency } | undefined
}): ReactNode {
  if (!isOrder && singleToken) {
    return (
      <ActivityVisual>
        <TokenLogo token={singleToken} size={32} />
      </ActivityVisual>
    )
  }

  if (inputToken && outputToken) {
    return (
      <ActivityVisual>
        {isBridgeOrder && order ? (
          <BridgeOrderVisual
            inputToken={inputToken}
            order={order}
            swapAndBridgeContext={swapAndBridgeContext}
            swapAndBridgeOverview={swapAndBridgeOverview}
          />
        ) : (
          <CurrencyLogoPair sellToken={inputToken} buyToken={outputToken} tokenSize={32} />
        )}
      </ActivityVisual>
    )
  }

  return null
}
