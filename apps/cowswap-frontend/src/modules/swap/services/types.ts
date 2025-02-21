import { CoWSwapEthFlow } from '@cowprotocol/abis'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import type { QuoteInformationObject } from 'legacy/state/price/reducer'

import { AppDataInfo, UploadAppDataParams } from 'modules/appData'

import { EthFlowOrderExistsCallback } from '../hooks/useCheckEthFlowOrderExists'

export type EthFlowContext = {
  contract: CoWSwapEthFlow
  useNewEthFlowContracts: boolean
  addTransaction: ReturnType<typeof useTransactionAdder>
  checkEthFlowOrderExists: EthFlowOrderExistsCallback
  addInFlightOrderId: (orderId: string) => void
  quote: QuoteInformationObject | undefined
  uploadAppData: (params: UploadAppDataParams) => void
  appData: AppDataInfo
}
