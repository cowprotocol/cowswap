import { useGnosisSafeInfo, useWalletInfo } from '@cowprotocol/wallet'

import { useBlockNumber } from 'entities/blockchain'
import { useAsyncMemo } from 'use-async-memo'
import { useConfig } from 'wagmi'
import { getTransactionCount } from 'wagmi/actions'

import { useGetSafeTxInfo } from 'legacy/hooks/useGetSafeTxInfo'
import { useAppDispatch } from 'legacy/state/hooks'
import { useCancelOrdersBatch } from 'legacy/state/orders/hooks'

import { useGetTwapOrderById } from 'modules/twap/hooks/useGetTwapOrderById'

import { useGetReceipt } from 'common/hooks/useGetReceipt'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { CheckEthereumTransactions } from '../types'

export function usePendingTransactionsContext(hasPendingTxs: boolean): CheckEthereumTransactions | null {
  const config = useConfig()
  const { chainId, account } = useWalletInfo()
  const safeInfo = useGnosisSafeInfo()
  const isSafeWallet = !!safeInfo
  const lastBlockNumber = useBlockNumber()

  const dispatch = useAppDispatch()
  const cancelOrdersBatch = useCancelOrdersBatch()
  const getReceipt = useGetReceipt(chainId)
  const getTxSafeInfo = useGetSafeTxInfo()
  const getTwapOrderById = useGetTwapOrderById()
  const nativeCurrencySymbol = useNativeCurrency().symbol || 'ETH'

  return useAsyncMemo(
    async () => {
      if (!lastBlockNumber || !account || !hasPendingTxs) return null

      // Fallback to 0 on failure so receipt checking can still run even when the nonce fetch fails
      // (e.g. temporary RPC errors). The nonce-based replacement check will simply be skipped.
      const transactionsCount = await getTransactionCount(config, { address: account }).catch(() => 0)

      const params: CheckEthereumTransactions = {
        chainId,
        isSafeWallet,
        lastBlockNumber,
        getReceipt,
        getTxSafeInfo,
        dispatch,
        nativeCurrencySymbol,
        cancelOrdersBatch,
        account,
        getTwapOrderById,
        transactionsCount,
        safeInfo,
      }

      return params
    },
    [
      chainId,
      account,
      isSafeWallet,
      config,
      lastBlockNumber,
      dispatch,
      getReceipt,
      getTxSafeInfo,
      nativeCurrencySymbol,
      cancelOrdersBatch,
      getTwapOrderById,
      safeInfo,
      hasPendingTxs,
    ],
    null,
  )
}
