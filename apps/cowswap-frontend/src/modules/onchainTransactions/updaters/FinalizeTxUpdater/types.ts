import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { GnosisSafeInfo } from '@cowprotocol/wallet'

import { GetSafeTxInfo } from 'legacy/hooks/useGetSafeTxInfo'
import { AppDispatch } from 'legacy/state'
import { CancelOrdersBatchCallback } from 'legacy/state/orders/hooks'

import type { useGetTwapOrderById } from 'modules/twap/hooks/useGetTwapOrderById'

import type { GetReceipt } from 'common/hooks/useGetReceipt'

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
  nativeCurrencySymbol: string
  cancelOrdersBatch: CancelOrdersBatchCallback
  safeInfo: GnosisSafeInfo | undefined
}
