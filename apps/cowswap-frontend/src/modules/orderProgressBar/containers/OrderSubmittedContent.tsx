import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrder } from 'legacy/state/orders/hooks'

import {
  useIsWaitAndSaveAvailable,
  useNavigateToNewOrderCallback,
  useTradeConfirmState,
  waitAndSaveEnabledAtom,
} from 'modules/trade'

import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'
import { TransactionSubmittedContent } from '../pure/TransactionSubmittedContent'

interface OrderSubmittedContentProps {
  onDismiss: Command
  successTitle?: ReactNode
}

export function OrderSubmittedContent({ onDismiss, successTitle }: OrderSubmittedContentProps): ReactNode {
  const { chainId } = useWalletInfo()
  const { transactionHash } = useTradeConfirmState()
  const order = useOrder({ chainId, id: transactionHash || undefined })
  const isWaitAndSaveAvailable = useIsWaitAndSaveAvailable()
  const isWaitAndSaveEnabled = useAtomValue(waitAndSaveEnabledAtom)
  // TODO: POC: hardcoded outcome on this confirmation only. Surplus/history of another order does not set this.
  const showWaitAndSaveOutcome = isWaitAndSaveAvailable && isWaitAndSaveEnabled

  const { props: orderProgressBarProps, activityDerivedState } = useOrderProgressBarProps(chainId, order)

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  return (
    <TransactionSubmittedContent
      chainId={chainId}
      hash={transactionHash || undefined}
      onDismiss={onDismiss}
      activityDerivedState={activityDerivedState}
      orderProgressBarProps={{ ...orderProgressBarProps, showWaitAndSaveOutcome }}
      navigateToNewOrderCallback={navigateToNewOrderCallback}
      successTitle={successTitle}
    />
  )
}
