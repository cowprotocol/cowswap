import { useGnosisSafeInfo, useWalletInfo } from '@cowprotocol/wallet'

import { getTransactionCount } from '@wagmi/core'
import { useAsyncMemo } from 'use-async-memo'
import { useConfig } from 'wagmi'

import { useGetSafeTxInfo } from 'legacy/hooks/useGetSafeTxInfo'
import { useAppDispatch } from 'legacy/state/hooks'
import { useCancelOrdersBatch } from 'legacy/state/orders/hooks'

import { useGetTwapOrderById } from 'modules/twap/hooks/useGetTwapOrderById'

import { useBlockNumber } from 'common/hooks/useBlockNumber'
import { useGetReceipt } from 'common/hooks/useGetReceipt'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { CheckEthereumTransactions } from '../types'

export function usePendingTransactionsContext(): CheckEthereumTransactions | null {
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
      if (!lastBlockNumber || !account) return null

      const transactionsCount = await getTransactionCount(config, { address: account })

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
    ],
    null,
  )
}
