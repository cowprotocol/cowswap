import { isSolverCompetitionPending, type SolverCompetitionPendingParams } from './solverCompetitionPending.utils'

import { OrderProgressBarStepName } from '../constants'

function pending(overrides: Partial<SolverCompetitionPendingParams> = {}): boolean {
  return isSolverCompetitionPending({
    hasWaitAndSaveSolvers: false,
    isConfirmationScreen: true,
    solverCompetitionReady: false,
    stepName: OrderProgressBarStepName.FINISHED,
    waitAndSavePending: false,
    ...overrides,
  })
}

describe('isSolverCompetitionPending', () => {
  it('hides the finished-step skeleton once Wait & Save has solver rows', () => {
    expect(pending({ hasWaitAndSaveSolvers: true, solverCompetitionReady: false })).toBe(false)
  })

  it('keeps the finished-step skeleton while no solver list is available', () => {
    expect(pending({ hasWaitAndSaveSolvers: false, solverCompetitionReady: false })).toBe(true)
    expect(pending({ hasWaitAndSaveSolvers: false, solverCompetitionReady: undefined })).toBe(true)
  })

  it('hides the skeleton once the order-status solver list is ready', () => {
    expect(pending({ solverCompetitionReady: true })).toBe(false)
  })

  it('keeps the confirmation skeleton while Wait & Save is still loading', () => {
    expect(
      pending({
        hasWaitAndSaveSolvers: true,
        solverCompetitionReady: true,
        waitAndSavePending: true,
      }),
    ).toBe(true)
    expect(
      pending({
        isConfirmationScreen: true,
        stepName: OrderProgressBarStepName.CANCELLATION_FAILED,
        waitAndSavePending: true,
      }),
    ).toBe(true)
  })

  it('does not use the finished-step placeholder on a failed cancellation with no solvers', () => {
    expect(
      pending({
        isConfirmationScreen: true,
        solverCompetitionReady: false,
        stepName: OrderProgressBarStepName.CANCELLATION_FAILED,
        waitAndSavePending: false,
      }),
    ).toBe(false)
  })
})
