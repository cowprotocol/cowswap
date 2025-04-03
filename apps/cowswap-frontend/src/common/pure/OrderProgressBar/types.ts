import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'

import { Order } from 'legacy/state/orders/actions'

import { OrderProgressBarStepName, SolverCompetition } from 'common/hooks/orderProgressBarV2'
import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'

export type OrderProgressBarV2Props = {
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
}
