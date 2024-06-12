import { useSetAtom } from 'jotai/index'

import { useAddPriorityAllowance } from '@cowprotocol/balances-and-allowances'
import { useGnosisSafeInfo, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useAsyncMemo } from 'use-async-memo'

import { useGetSafeTxInfo } from 'legacy/hooks/useGetSafeTxInfo'
import { useAppDispatch } from 'legacy/state/hooks'
import { useCancelOrdersBatch } from 'legacy/state/orders/hooks'

import { removeInFlightOrderIdAtom } from 'modules/swap/state/EthFlow/ethFlowInFlightOrderIdsAtom'
import { useGetTwapOrderById } from 'modules/twap/hooks/useGetTwapOrderById'

import { useBlockNumber } from 'common/hooks/useBlockNumber'
import { useGetReceipt } from 'common/hooks/useGetReceipt'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { CheckEthereumTransactions } from '../types'

// TODO: rename to usePendingTransactionsContext
export function useCheckEthereumTransactions(): CheckEthereumTransactions | null {
  const provider = useWalletProvider()
  const { chainId, account } = useWalletInfo()
  const safeInfo = useGnosisSafeInfo()
  const isSafeWallet = !!safeInfo
  const lastBlockNumber = useBlockNumber()

  const dispatch = useAppDispatch()
  const cancelOrdersBatch = useCancelOrdersBatch()
  const getReceipt = useGetReceipt(chainId)
  const getTxSafeInfo = useGetSafeTxInfo()
  const addPriorityAllowance = useAddPriorityAllowance()
  const getTwapOrderById = useGetTwapOrderById()
  const removeInFlightOrderId = useSetAtom(removeInFlightOrderIdAtom)
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
        removeInFlightOrderId,
        nativeCurrencySymbol,
        cancelOrdersBatch,
        addPriorityAllowance,
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
      provider,
      lastBlockNumber,
      dispatch,
      getReceipt,
      getTxSafeInfo,
      removeInFlightOrderId,
      nativeCurrencySymbol,
      cancelOrdersBatch,
      addPriorityAllowance,
      getTwapOrderById,
      safeInfo,
    ],
    null
  )
}
