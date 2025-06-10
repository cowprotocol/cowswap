import { CompetitionOrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import type { Order } from 'legacy/state/orders/actions'

import type { SwapAndBridgeContext } from 'modules/bridge'

import type { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { SolverCompetition } from 'common/types/soverCompetition'

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
