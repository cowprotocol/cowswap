import { SolverInfo } from '@cowprotocol/core'
import { CompetitionOrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import type { Order } from 'legacy/state/orders/actions'

import type { SwapAndBridgeContext } from 'modules/bridge'

import type { SurplusData } from 'common/hooks/useGetSurplusFiatValue'

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
export type BridgingFlowStep = 'bridgingInProgress' | 'bridgingFailed' | 'refundCompleted' | 'bridgingFinished'
type errorFlow = 'delayed' | 'solved' | 'unfillable' | 'submissionFailed'
type cancellationFlow = 'cancelling' | 'cancelled' | 'expired' | 'cancellationFailed'
export type OrderProgressBarStepName = happyPath | errorFlow | cancellationFlow | BridgingFlowStep

/**
 * Frontend-defined step name constants.
 * These are mapped from backend CompetitionOrderStatus.type values
 * but provide more granular UI states for better user experience.
 */
export const STEP_NAMES = {
  INITIAL: 'initial',
  SOLVING: 'solving',
  EXECUTING: 'executing',
  FINISHED: 'finished',
  DELAYED: 'delayed',
  SOLVED: 'solved',
  UNFILLABLE: 'unfillable',
  SUBMISSION_FAILED: 'submissionFailed',
  CANCELLING: 'cancelling',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  CANCELLATION_FAILED: 'cancellationFailed',
  BRIDGING_IN_PROGRESS: 'bridgingInProgress',
  BRIDGING_FAILED: 'bridgingFailed',
  REFUND_COMPLETED: 'refundCompleted',
  BRIDGING_FINISHED: 'bridgingFinished',
} as const

export const DEFAULT_STEP_NAME: OrderProgressBarStepName = STEP_NAMES.INITIAL

type Unpacked<T> = T extends (infer U)[] ? U : never
export type ApiSolverCompetition = Unpacked<CompetitionOrderStatus['value']>
export type SolverCompetition = ApiSolverCompetition & Partial<SolverInfo>

export type OrderProgressBarProps = {
  stepName?: OrderProgressBarStepName
  chainId: SupportedChainId
  countdown?: number | null | undefined
  solverCompetition?: SolverCompetition[]
  totalSolvers?: number
  order?: Order
  debugMode?: boolean
  showCancellationModal: Command | null
  surplusData?: SurplusData
  receiverEnsName?: string
  navigateToNewOrder?: Command
  isProgressBarSetup: boolean
  swapAndBridgeContext?: SwapAndBridgeContext
  isBridgingTrade: boolean
}
