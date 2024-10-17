import { useSetAtom } from 'jotai'

import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { useGetQuoteAndStatus } from 'legacy/state/price/hooks'

import { useAppData, useUploadAppData } from 'modules/appData'

import { useEthFlowContract } from 'common/hooks/useContract'

import { useCheckEthFlowOrderExists } from './useCheckEthFlowOrderExists'
import { useDerivedSwapInfo } from './useSwapState'

import { EthFlowContext } from '../services/types'
import { addInFlightOrderIdAtom } from '../state/EthFlow/ethFlowInFlightOrderIdsAtom'

export function useEthFlowContext(): EthFlowContext | null {
  const { chainId } = useWalletInfo()
  const { currenciesIds } = useDerivedSwapInfo()
  const { quote } = useGetQuoteAndStatus({
    token: currenciesIds.INPUT,
    chainId,
  })
  const contract = useEthFlowContract()
  const addTransaction = useTransactionAdder()
  const uploadAppData = useUploadAppData()
  const appData = useAppData()

  const addInFlightOrderId = useSetAtom(addInFlightOrderIdAtom)

  const checkEthFlowOrderExists = useCheckEthFlowOrderExists()

  return (
    useSWR(
      appData && contract
        ? [quote, contract, addTransaction, checkEthFlowOrderExists, addInFlightOrderId, uploadAppData, appData]
        : null,
      ([quote, contract, addTransaction, checkEthFlowOrderExists, addInFlightOrderId, uploadAppData, appData]) => {
        return {
          quote,
          contract,
          addTransaction,
          checkEthFlowOrderExists,
          addInFlightOrderId,
          uploadAppData,
          appData,
        }
      },
    ).data || null
  )
}
