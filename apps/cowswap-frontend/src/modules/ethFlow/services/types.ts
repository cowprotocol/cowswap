import { CoWSwapEthFlow } from '@cowprotocol/abis'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { AppDataInfo, UploadAppDataParams } from 'modules/appData'
import { TradeQuoteState } from 'modules/tradeQuote'

import { EthFlowOrderExistsCallback } from '../hooks/useCheckEthFlowOrderExists'

export type EthFlowContext = {
  contract: CoWSwapEthFlow
  addTransaction: ReturnType<typeof useTransactionAdder>
  checkEthFlowOrderExists: EthFlowOrderExistsCallback
  addInFlightOrderId: (orderId: string) => void
  quote: TradeQuoteState | undefined
  uploadAppData: (params: UploadAppDataParams) => void
  appData: AppDataInfo
}
