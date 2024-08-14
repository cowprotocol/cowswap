import type { CompetitionOrderStatus } from '@cowprotocol/cow-sdk'

export type OrderProgressBarState = {
  countdown?: number | null
  backendApiStatus?: CompetitionOrderStatus.type
  solverCompetition?: CompetitionOrderStatus['value']
  progressBarStepName?: OrderProgressBarStepName
  previousStepName?: OrderProgressBarStepName
  lastTimeChangedSteps?: number
  cancellationTriggered?: true
}

export type OrdersProgressBarState = Record<string, OrderProgressBarState>

export type OrdersProgressBarCountdown = Record<string, number | null>

type happyPath = 'initial' | 'solving' | 'solved' | 'executing' | 'finished'
type errorFlow = 'nextBatch' | 'delayed' | 'unfillable' | 'submissionFailed'
type cancellationFlow = 'cancelling' | 'cancelled' | 'expired' | 'cancellationFailed'
export type OrderProgressBarStepName = happyPath | errorFlow | cancellationFlow
