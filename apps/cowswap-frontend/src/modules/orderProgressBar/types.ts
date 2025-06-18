import { SolverInfo } from '@cowprotocol/core'
import { CompetitionOrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import type { Order } from 'legacy/state/orders/actions'

import type { SwapAndBridgeContext } from 'modules/bridge'

import type { SurplusData } from 'common/hooks/useGetSurplusFiatValue'

import { OrderProgressBarStepName } from './constants'

export { OrderProgressBarStepName }

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

export type BridgingFlowStep =
  | OrderProgressBarStepName.BRIDGING_IN_PROGRESS
  | OrderProgressBarStepName.BRIDGING_FAILED
  | OrderProgressBarStepName.REFUND_COMPLETED
  | OrderProgressBarStepName.BRIDGING_FINISHED

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
