import { useAddPriorityAllowance } from '@cowprotocol/balances-and-allowances'
import { GetReceipt } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { GnosisSafeInfo } from '@cowprotocol/wallet'

import { GetSafeTxInfo } from 'legacy/hooks/useGetSafeTxInfo'
import { AppDispatch } from 'legacy/state'
import { CancelOrdersBatchCallback } from 'legacy/state/orders/hooks'

import type { useGetTwapOrderById } from 'modules/twap/hooks/useGetTwapOrderById'

export interface CheckEthereumTransactions {
  chainId: SupportedChainId
  account: string | undefined
  transactionsCount: number
  isSafeWallet: boolean
  lastBlockNumber: number
  getTwapOrderById: ReturnType<typeof useGetTwapOrderById>
  getReceipt: GetReceipt
  getTxSafeInfo: GetSafeTxInfo
  dispatch: AppDispatch
  addPriorityAllowance: ReturnType<typeof useAddPriorityAllowance>
  removeInFlightOrderId: (update: string) => void
  nativeCurrencySymbol: string
  cancelOrdersBatch: CancelOrdersBatchCallback
  safeInfo: GnosisSafeInfo | undefined
}
