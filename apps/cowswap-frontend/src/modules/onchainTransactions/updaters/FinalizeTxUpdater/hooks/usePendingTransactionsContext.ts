import { useGnosisSafeInfo, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useAsyncMemo } from 'use-async-memo'

import { useGetSafeTxInfo } from 'legacy/hooks/useGetSafeTxInfo'
import { useAppDispatch } from 'legacy/state/hooks'
import { useCancelOrdersBatch } from 'legacy/state/orders/hooks'

import { useGetTwapOrderById } from 'modules/twap/hooks/useGetTwapOrderById'

import { useBlockNumber } from 'common/hooks/useBlockNumber'
import { useGetReceipt } from 'common/hooks/useGetReceipt'
import { useUpdateLastApproveTxBlockNumber } from 'common/hooks/useTokenAllowance'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { CheckEthereumTransactions } from '../types'

export function usePendingTransactionsContext(): CheckEthereumTransactions | null {
  const provider = useWalletProvider()
  const { chainId, account } = useWalletInfo()
  const safeInfo = useGnosisSafeInfo()
  const isSafeWallet = !!safeInfo
  const lastBlockNumber = useBlockNumber()

  const updateLastApproveTxBlockNumber = useUpdateLastApproveTxBlockNumber()
  const dispatch = useAppDispatch()
  const cancelOrdersBatch = useCancelOrdersBatch()
  const getReceipt = useGetReceipt(chainId)
  const getTxSafeInfo = useGetSafeTxInfo()
  const getTwapOrderById = useGetTwapOrderById()
  const nativeCurrencySymbol = useNativeCurrency().symbol || 'ETH'

  return useAsyncMemo(
    async () => {
      if (!provider || !lastBlockNumber || !account) return null

      const transactionsCount = await provider.getTransactionCount(account)

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
        updateLastApproveTxBlockNumber,
      }

      return params
    },
    [
      chainId,
      account,
      isSafeWallet,
      provider,
      lastBlockNumber,
      dispatch,
      getReceipt,
      getTxSafeInfo,
      nativeCurrencySymbol,
      cancelOrdersBatch,
      getTwapOrderById,
      safeInfo,
      updateLastApproveTxBlockNumber,
    ],
    null,
  )
}
