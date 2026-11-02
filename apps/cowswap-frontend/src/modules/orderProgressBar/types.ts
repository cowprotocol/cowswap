import { CompetitionOrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import type { Order } from 'legacy/state/orders/actions'

import type { SwapAndBridgeContext } from 'modules/bridge'

import type { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { SolverCompetition } from 'common/types/soverCompetition'

import { OrderProgressBarStepName } from './constants'

import type { WaitAndSaveStrip } from './pure/WaitAndSaveOutcome/selectWaitAndSaveStrip.utils'
import type { WaitAndSaveOutcomeProps } from './pure/WaitAndSaveOutcome/WaitAndSaveOutcome.pure'

export { OrderProgressBarStepName }

export type BridgingFlowStep =
  | OrderProgressBarStepName.BRIDGING_IN_PROGRESS
  | OrderProgressBarStepName.BRIDGING_FAILED
  | OrderProgressBarStepName.REFUND_COMPLETED
  | OrderProgressBarStepName.BRIDGING_FINISHED

export type OrderProgressBarProps = {
  stepName?: OrderProgressBarStepName
  chainId: SupportedChainId
  countdown?: number | null | undefined
  solverCompetition?: SolverCompetition[]
  solverCompetitionPending?: boolean
  solverCompetitionReady?: boolean
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
  waitAndSave?: {
    outcome?: WaitAndSaveOutcomeProps
    pending?: boolean
    strip?: WaitAndSaveStrip
  }
}

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

export type OrdersProgressBarCountdown = Record<string, number | null>

export type OrdersProgressBarState = Record<string, OrderProgressBarState>
