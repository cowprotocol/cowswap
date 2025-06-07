import { useCallback, useEffect, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import { useOrder } from 'legacy/state/orders/hooks'

import { BridgeQuoteAmounts } from 'modules/bridge'
import { useNavigateToNewOrderCallback, useTradeConfirmState } from 'modules/trade'

import { useOrderProgressBarProps } from './useOrderProgressBarProps'

import { TransactionSubmittedContent } from '../pure/TransactionSubmittedContent'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOrderSubmittedContent(chainId: SupportedChainId, _bridgeQuoteAmounts?: BridgeQuoteAmounts) {
  const { transactionHash, pendingTrade } = useTradeConfirmState()
  const hasPendingTrade = !!pendingTrade
  const order = useOrder({ chainId, id: transactionHash || undefined })

  const [bridgeQuoteAmounts, setBridgeQuoteAmounts] = useState<BridgeQuoteAmounts | undefined>(_bridgeQuoteAmounts)

  /**
   * Remember bridgeQuoteAmounts and don't update it while has pending trade
   */
  useEffect(() => {
    if (hasPendingTrade) return
    if (!_bridgeQuoteAmounts) return

    setBridgeQuoteAmounts(_bridgeQuoteAmounts)
  }, [hasPendingTrade, _bridgeQuoteAmounts])

  const { props: orderProgressBarProps, activityDerivedState } = useOrderProgressBarProps(
    chainId,
    order,
    bridgeQuoteAmounts,
  )

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  return useCallback(
    (onDismiss: Command) => (
      <TransactionSubmittedContent
        chainId={chainId}
        hash={transactionHash || undefined}
        onDismiss={onDismiss}
        activityDerivedState={activityDerivedState}
        orderProgressBarProps={orderProgressBarProps}
        navigateToNewOrderCallback={navigateToNewOrderCallback}
      />
    ),
    [chainId, transactionHash, orderProgressBarProps, activityDerivedState, navigateToNewOrderCallback],
  )
}
