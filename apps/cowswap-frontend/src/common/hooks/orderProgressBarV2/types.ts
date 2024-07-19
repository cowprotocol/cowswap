import { PendingOrderStatusType, SolverCompetition } from 'api/cowProtocol/api'

export type OrderProgressBarState = {
  countdown?: number | null
  backendApiStatus?: PendingOrderStatusType
  solverCompetition?: SolverCompetition
  progressBarStepName?: OrderProgressBarStepName
  previousStepName?: OrderProgressBarStepName
  lastTimeChangedSteps?: number
  currentTimeChangedSteps?: number
}

export type OrdersProgressBarState = Record<string, OrderProgressBarState>

export type OrdersProgressBarCountdown = Record<string, number | null>

type happyPath = 'initial' | 'solving' | 'solved' | 'executing' | 'finished'
type errorFlow = 'nextBatch' | 'delayed' | 'unfillable' | 'submissionFailed'
export type OrderProgressBarStepName = happyPath | errorFlow
