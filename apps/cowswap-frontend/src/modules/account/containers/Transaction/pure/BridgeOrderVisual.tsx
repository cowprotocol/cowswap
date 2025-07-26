import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'

import { CurrencyLogoPair } from 'common/pure/CurrencyLogoPair'
import { IconSpinner } from 'common/pure/IconSpinner'
import { ActivityDerivedState } from 'common/types/activity'

export function BridgeOrderVisual({
  inputToken,
  order,
  swapAndBridgeContext,
  swapAndBridgeOverview,
}: {
  inputToken: unknown
  order: ActivityDerivedState['order']
  swapAndBridgeContext: { statusResult?: unknown } | undefined
  swapAndBridgeOverview: { targetCurrency?: unknown } | undefined
}): ReactNode {
  const isLocalOrderCached = order.inputToken.chainId !== order.outputToken.chainId
  const hasConfirmedBridgeData = swapAndBridgeContext?.statusResult

  // For localStorage orders: use order.outputToken immediately (no API wait, no flash)
  if (isLocalOrderCached) {
    return <CurrencyLogoPair sellToken={inputToken} buyToken={order.outputToken} tokenSize={32} />
  }

  // For fresh sessions: only show CurrencyLogoPair when we have confirmed bridge data
  if (hasConfirmedBridgeData && swapAndBridgeOverview?.targetCurrency) {
    return (
      <CurrencyLogoPair
        sellToken={inputToken}
        buyToken={swapAndBridgeOverview.targetCurrency}
        tokenSize={32}
      />
    )
  }

  // Show spinner when waiting for API data in fresh sessions (don't use CurrencyLogoPair)
  return (
    <>
      <TokenLogo token={inputToken} size={32} />
      <IconSpinner spinnerWidth={1} margin="0 0 0 -4px" size={30} />
    </>
  )
}