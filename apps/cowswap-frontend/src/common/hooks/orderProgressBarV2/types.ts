import { SolverInfo } from '@cowprotocol/core'
import type { CompetitionOrderStatus } from '@cowprotocol/cow-sdk'

export type OrderProgressBarState = {
  countdown?: number | null
  backendApiStatus?: CompetitionOrderStatus.type
  previousBackendApiStatus?: CompetitionOrderStatus.type
  solverCompetition?: CompetitionOrderStatus['value']
  progressBarStepName?: OrderProgressBarStepName
  previousStepName?: OrderProgressBarStepName
  lastTimeChangedSteps?: number
  cancellationTriggered?: true
}

export type OrdersProgressBarState = Record<string, OrderProgressBarState>

export type OrdersProgressBarCountdown = Record<string, number | null>

type happyPath = 'initial' | 'solving' | 'executing' | 'finished'
type errorFlow = 'delayed' | 'solved' | 'unfillable' | 'submissionFailed'
type cancellationFlow = 'cancelling' | 'cancelled' | 'expired' | 'cancellationFailed'
export type OrderProgressBarStepName = happyPath | errorFlow | cancellationFlow

type Unpacked<T> = T extends (infer U)[] ? U : never
export type ApiSolverCompetition = Unpacked<CompetitionOrderStatus['value']>
export type SolverCompetition = ApiSolverCompetition & Partial<SolverInfo>
