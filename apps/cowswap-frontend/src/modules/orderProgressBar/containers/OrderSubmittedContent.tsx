import { ReactNode, useEffect } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useMarkSurplusOrderDisplayed } from 'entities/surplusModal'

import { useOrder } from 'legacy/state/orders/hooks'

import { useNavigateToNewOrderCallback, useTradeConfirmState } from 'modules/trade'

import { OrderProgressBarStepName } from '../constants'
import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'
import { TransactionSubmittedContent } from '../pure/TransactionSubmittedContent'

interface OrderSubmittedContentProps {
  onDismiss: Command
}

export function OrderSubmittedContent({ onDismiss }: OrderSubmittedContentProps): ReactNode {
  const { chainId } = useWalletInfo()
  const { transactionHash } = useTradeConfirmState()
  const order = useOrder({ chainId, id: transactionHash || undefined })
  const markOrderDisplayed = useMarkSurplusOrderDisplayed()

  const { props: orderProgressBarProps, activityDerivedState } = useOrderProgressBarProps(chainId, order)
  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  useEffect(() => {
    if (!order?.id || !shouldConsumeSurplusQueue(orderProgressBarProps.stepName)) {
      return
    }

    markOrderDisplayed(order.id)
  }, [markOrderDisplayed, order?.id, orderProgressBarProps.stepName])

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

function shouldConsumeSurplusQueue(stepName: OrderProgressBarStepName | undefined): boolean {
  return (
    stepName === OrderProgressBarStepName.FINISHED ||
    stepName === OrderProgressBarStepName.CANCELLATION_FAILED ||
    stepName === OrderProgressBarStepName.BRIDGING_FINISHED
  )
}
