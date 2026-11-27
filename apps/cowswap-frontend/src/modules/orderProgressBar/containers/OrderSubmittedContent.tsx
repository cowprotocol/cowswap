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

import { OrderProgressBarStepName } from '../constants'
import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'
import { useWaitAndSaveConfirmation } from '../hooks/useWaitAndSaveConfirmation'
import { TransactionSubmittedContent } from '../pure/TransactionSubmittedContent'
import { isSolverCompetitionPending } from '../utils/solverCompetitionPending.utils'

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
  const isConfirmationScreen =
    orderProgressBarProps.stepName === OrderProgressBarStepName.FINISHED ||
    orderProgressBarProps.stepName === OrderProgressBarStepName.CANCELLATION_FAILED
  const loadSolverCompetition = showWaitAndSaveOutcome && isConfirmationScreen

  // Wait & Save only. The order-status solver list is already enough to draw the auction bars.
  // This request loads the settlement, including every other order in each solution, so we can tell
  // whether batching this order paid more than the best bid that contained only this order.
  const waitAndSave = useWaitAndSaveConfirmation({
    buyToken: order?.outputToken,
    chainId,
    enabled: loadSolverCompetition,
    orderUid: order?.id,
  })

  let solverCompetition = orderProgressBarProps.solverCompetition

  if (waitAndSave.pending) {
    // Order-status solvers may already be here. Hide them until Wait & Save finishes, or the auction changes.
    solverCompetition = undefined
  } else if (waitAndSave.solvers && waitAndSave.solvers.length > 0) {
    // Wait & Save finished with its own solver list. Show that one.
    solverCompetition = waitAndSave.solvers
  }

  const solverCompetitionPending = isSolverCompetitionPending({
    hasWaitAndSaveSolvers: Boolean(waitAndSave.solvers?.length),
    isConfirmationScreen,
    solverCompetitionReady: orderProgressBarProps.solverCompetitionReady,
    stepName: orderProgressBarProps.stepName,
    waitAndSavePending: waitAndSave.pending,
  })

  const navigateToNewOrderCallback = useNavigateToNewOrderCallback()

  return (
    <TransactionSubmittedContent
      chainId={chainId}
      hash={transactionHash || undefined}
      onDismiss={onDismiss}
      activityDerivedState={activityDerivedState}
      orderProgressBarProps={{
        ...orderProgressBarProps,
        solverCompetition,
        solverCompetitionPending,
        waitAndSave: loadSolverCompetition
          ? { outcome: waitAndSave.outcome, pending: waitAndSave.pending, strip: waitAndSave.strip }
          : undefined,
      }}
      navigateToNewOrderCallback={navigateToNewOrderCallback}
      successTitle={successTitle}
    />
  )
}
