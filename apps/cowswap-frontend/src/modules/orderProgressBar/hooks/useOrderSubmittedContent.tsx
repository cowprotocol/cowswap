import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import { useOrder } from 'legacy/state/orders/hooks'

import { useNavigateToNewOrderCallback, useTradeConfirmState } from 'modules/trade'

import { useOrderProgressBarProps } from './useOrderProgressBarProps'

import { TransactionSubmittedContent } from '../pure/TransactionSubmittedContent'

export function useOrderSubmittedContent(chainId: SupportedChainId) {
  const { transactionHash } = useTradeConfirmState()
  const order = useOrder({ chainId, id: transactionHash || undefined })

  const orderProgressBarProps = useOrderProgressBarProps(chainId, order)

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  return useCallback(
    (onDismiss: Command) => (
      <TransactionSubmittedContent
        chainId={chainId}
        hash={transactionHash || undefined}
        onDismiss={onDismiss}
        activityDerivedState={orderProgressBarProps.activityDerivedState}
        orderProgressBarProps={orderProgressBarProps}
        navigateToNewOrderCallback={navigateToNewOrderCallback}
      />
    ),
    [chainId, transactionHash, orderProgressBarProps, navigateToNewOrderCallback],
  )
}
