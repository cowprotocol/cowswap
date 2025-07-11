import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrder } from 'legacy/state/orders/hooks'

import { useNavigateToNewOrderCallback, useTradeConfirmState } from 'modules/trade'

import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'
import { TransactionSubmittedContent } from '../pure/TransactionSubmittedContent'

interface OrderSubmittedContentProps {
  onDismiss: Command
}

export function OrderSubmittedContent({ onDismiss }: OrderSubmittedContentProps): ReactNode {
  const { chainId } = useWalletInfo()
  const { transactionHash } = useTradeConfirmState()
  const order = useOrder({ chainId, id: transactionHash || undefined })

  const { props: orderProgressBarProps, activityDerivedState } = useOrderProgressBarProps(chainId, order)

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
