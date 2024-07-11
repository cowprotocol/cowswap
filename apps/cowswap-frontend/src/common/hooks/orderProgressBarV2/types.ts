import { PendingOrderStatusType, SolverCompetition } from 'api/cowProtocol/api'

export type ExecutingOrderState = {
  countdown?: number | null
  backendApiStatus?: PendingOrderStatusType
  solverCompetition?: SolverCompetition
  progressBarStepName?: OrderProgressBarStepName
}

export type ExecutingOrdersState = Record<string, ExecutingOrderState>

export type ExecutingOrdersCountdown = Record<string, number | null>

type happyPath = 'initial' | 'solving' | 'executing' | 'finished'
type errorFlow = 'nextBatch' | 'delayed' | 'unfillable' | 'submissionFailed'
export type OrderProgressBarStepName = happyPath | errorFlow
