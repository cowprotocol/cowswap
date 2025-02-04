import { CoWSwapEthFlow } from '@cowprotocol/abis'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import type { QuoteInformationObject } from 'legacy/state/price/reducer'

import { AppDataInfo, UploadAppDataParams } from 'modules/appData'

import { EthSendingTransactionInfo } from '../../../common/hooks/useLogEthSendingTransaction'
import { EthFlowOrderExistsCallback } from '../hooks/useCheckEthFlowOrderExists'

export type EthFlowContext = {
  contract: CoWSwapEthFlow
  addTransaction: ReturnType<typeof useTransactionAdder>
  checkEthFlowOrderExists: EthFlowOrderExistsCallback
  addInFlightOrderId: (orderId: string) => void
  logEthSendingTransaction: (info: EthSendingTransactionInfo) => void
  quote: QuoteInformationObject | undefined
  uploadAppData: (params: UploadAppDataParams) => void
  appData: AppDataInfo
}
