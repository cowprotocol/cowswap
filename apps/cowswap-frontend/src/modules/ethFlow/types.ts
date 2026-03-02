import type { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import type { EthFlowContractData } from 'common/hooks/useContract'

import type { EthFlowOrderExistsCallback } from './hooks/useCheckEthFlowOrderExists'

export type EthFlowContext = {
  contract: EthFlowContractData
  addTransaction: ReturnType<typeof useTransactionAdder>
  checkEthFlowOrderExists: EthFlowOrderExistsCallback
  addInFlightOrderId: (orderId: string) => void
}
