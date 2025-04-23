import type { CoWSwapEthFlow } from '@cowprotocol/abis'

import type { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import type { AppDataInfo, UploadAppDataParams } from 'modules/appData'

import type { EthFlowOrderExistsCallback } from './hooks/useCheckEthFlowOrderExists'

export type EthFlowContext = {
  contract: CoWSwapEthFlow
  addTransaction: ReturnType<typeof useTransactionAdder>
  checkEthFlowOrderExists: EthFlowOrderExistsCallback
  addInFlightOrderId: (orderId: string) => void
  uploadAppData: (params: UploadAppDataParams) => void
  appData: AppDataInfo
}
