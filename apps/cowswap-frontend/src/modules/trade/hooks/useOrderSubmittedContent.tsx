import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import { useOrder } from 'legacy/state/orders/hooks'

import { useOrderProgressBarV2Props } from 'common/hooks/orderProgressBarV2'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'

import { useNavigateToNewOrderCallback } from './useNavigateToNewOrderCallback'
import { useTradeConfirmState } from './useTradeConfirmState'

export function useOrderSubmittedContent(chainId: SupportedChainId) {
  const { transactionHash } = useTradeConfirmState()
  const order = useOrder({ chainId, id: transactionHash || undefined })

  const orderProgressBarV2Props = useOrderProgressBarV2Props(chainId, order)

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  return useCallback(
    (onDismiss: Command) => (
      <TransactionSubmittedContent
        chainId={chainId}
        hash={transactionHash || undefined}
        onDismiss={onDismiss}
        activityDerivedState={orderProgressBarV2Props.activityDerivedState}
        orderProgressBarV2Props={orderProgressBarV2Props}
        navigateToNewOrderCallback={navigateToNewOrderCallback}
      />
    ),
    [chainId, transactionHash, orderProgressBarV2Props, navigateToNewOrderCallback],
  )
}
