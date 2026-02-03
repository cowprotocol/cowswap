import type { CoWSwapEthFlow } from '@cowprotocol/cowswap-abis'

import type { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import type { EthFlowOrderExistsCallback } from './hooks/useCheckEthFlowOrderExists'

export type EthFlowContext = {
  contract: CoWSwapEthFlow
  addTransaction: ReturnType<typeof useTransactionAdder>
  checkEthFlowOrderExists: EthFlowOrderExistsCallback
  addInFlightOrderId: (orderId: string) => void
}
