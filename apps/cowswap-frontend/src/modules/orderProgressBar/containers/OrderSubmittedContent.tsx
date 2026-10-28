import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

import {
  useIsWaitAndSaveAvailable,
  useNavigateToNewOrderCallback,
  useTradeConfirmState,
  waitAndSaveEnabledAtom,
} from 'modules/trade'

import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'
import { useWaitAndSaveConfirmation } from '../hooks/useWaitAndSaveConfirmation'
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
  const showWaitAndSaveOutcome = isWaitAndSaveAvailable && isWaitAndSaveEnabled

  const { props: orderProgressBarProps, activityDerivedState } = useOrderProgressBarProps(chainId, order)
  const waitAndSave = useWaitAndSaveConfirmation({
    buyToken: order?.outputToken,
    chainId,
    enabled: showWaitAndSaveOutcome && order?.status === OrderStatus.FULFILLED,
    orderUid: order?.id,
  })
  const solverCompetition =
    waitAndSave.solvers && waitAndSave.solvers.length > 0
      ? waitAndSave.solvers
      : orderProgressBarProps.solverCompetition

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  return (
    <TransactionSubmittedContent
      chainId={chainId}
      hash={transactionHash || undefined}
      onDismiss={onDismiss}
      activityDerivedState={activityDerivedState}
      orderProgressBarProps={{
        ...orderProgressBarProps,
        deferFinishedConfirmation: waitAndSave.pending,
        solverCompetition,
        waitAndSave: waitAndSave.strip ? { outcome: waitAndSave.outcome, strip: waitAndSave.strip } : undefined,
      }}
      navigateToNewOrderCallback={navigateToNewOrderCallback}
      successTitle={successTitle}
    />
  )
}
