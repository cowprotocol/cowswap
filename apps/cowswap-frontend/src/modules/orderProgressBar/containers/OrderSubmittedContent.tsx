import { ReactNode, useEffect, useState } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrder } from 'legacy/state/orders/hooks'

import { BridgeQuoteAmounts } from 'modules/bridge'
import { useNavigateToNewOrderCallback, useTradeConfirmState } from 'modules/trade'

import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'
import { TransactionSubmittedContent } from '../pure/TransactionSubmittedContent'

interface OrderSubmittedContentProps {
  onDismiss: Command
  bridgeQuoteAmounts?: BridgeQuoteAmounts
}

export function OrderSubmittedContent({
  onDismiss,
  bridgeQuoteAmounts: _bridgeQuoteAmounts,
}: OrderSubmittedContentProps): ReactNode {
  const { chainId } = useWalletInfo()
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

  return (
    <TransactionSubmittedContent
      chainId={chainId}
      hash={transactionHash || undefined}
      onDismiss={onDismiss}
      activityDerivedState={activityDerivedState}
      orderProgressBarProps={orderProgressBarProps}
      navigateToNewOrderCallback={navigateToNewOrderCallback}
    />
  )
}
