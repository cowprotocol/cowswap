import { useSetAtom } from 'jotai'

import useSWR from 'swr'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { useGetQuoteAndStatus } from 'legacy/state/price/hooks'

import { useAppData, useUploadAppData } from 'modules/appData'

import { useEthFlowContract } from 'common/hooks/useContract'
import { useLogEthSendingTransaction } from 'common/hooks/useLogEthSendingTransaction'

import { useCheckEthFlowOrderExists } from './useCheckEthFlowOrderExists'
import { useDerivedSwapInfo } from './useSwapState'

import { EthFlowContext } from '../services/types'
import { addInFlightOrderIdAtom } from '../state/EthFlow/ethFlowInFlightOrderIdsAtom'

export function useEthFlowContext(): EthFlowContext | null {
  const { contract: ethFlowContract, chainId: ethFlowChainId } = useEthFlowContract()
  const { currenciesIds } = useDerivedSwapInfo()
  const { quote } = useGetQuoteAndStatus({
    token: currenciesIds.INPUT,
    chainId: ethFlowChainId,
  })

  const addTransaction = useTransactionAdder()
  const uploadAppData = useUploadAppData()
  const appData = useAppData()
  const logEthSendingTransaction = useLogEthSendingTransaction()

  const addInFlightOrderId = useSetAtom(addInFlightOrderIdAtom)

  const checkEthFlowOrderExists = useCheckEthFlowOrderExists()

  return (
    useSWR(
      appData && ethFlowContract
        ? [
            quote,
            ethFlowContract,
            addTransaction,
            checkEthFlowOrderExists,
            addInFlightOrderId,
            logEthSendingTransaction,
            uploadAppData,
            appData,
          ]
        : null,
      ([
        quote,
        contract,
        addTransaction,
        checkEthFlowOrderExists,
        addInFlightOrderId,
        logEthSendingTransaction,
        uploadAppData,
        appData,
      ]) => {
        return {
          quote,
          contract,
          addTransaction,
          checkEthFlowOrderExists,
          addInFlightOrderId,
          logEthSendingTransaction,
          uploadAppData,
          appData,
        }
      },
    ).data || null
  )
}
