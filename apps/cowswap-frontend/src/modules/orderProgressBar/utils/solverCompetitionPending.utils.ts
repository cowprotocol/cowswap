import { OrderProgressBarStepName } from '../constants'

export interface SolverCompetitionPendingParams {
  hasWaitAndSaveSolvers: boolean
  isConfirmationScreen: boolean
  solverCompetitionReady: boolean | undefined
  stepName: OrderProgressBarStepName | undefined
  waitAndSavePending: boolean
}

export function isSolverCompetitionPending({
  hasWaitAndSaveSolvers,
  isConfirmationScreen,
  solverCompetitionReady,
  stepName,
  waitAndSavePending,
}: SolverCompetitionPendingParams): boolean {
  return (
    // Filled order: keep the placeholder until order-status or Wait & Save solvers have arrived.
    (stepName === OrderProgressBarStepName.FINISHED && !solverCompetitionReady && !hasWaitAndSaveSolvers) ||
    // Filled order or failed cancellation: also keep it up while Wait & Save is still loading.
    (isConfirmationScreen && waitAndSavePending)
  )
}
