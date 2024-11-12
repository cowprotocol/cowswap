import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useAppData, useUploadAppData } from 'modules/appData'
import { useTradeQuote } from 'modules/tradeQuote'

import { useEthFlowContract } from 'common/hooks/useContract'

import { useCheckEthFlowOrderExists } from './useCheckEthFlowOrderExists'

import { EthFlowContext } from '../services/types'
import { addInFlightOrderIdAtom } from '../state/ethFlowInFlightOrderIdsAtom'

export function useEthFlowContext(): EthFlowContext | null {
  const quote = useTradeQuote()
  const contract = useEthFlowContract()
  const addTransaction = useTransactionAdder()
  const uploadAppData = useUploadAppData()
  const appData = useAppData()

  const addInFlightOrderId = useSetAtom(addInFlightOrderIdAtom)

  const checkEthFlowOrderExists = useCheckEthFlowOrderExists()

  return useMemo(() => {
    return appData && contract
      ? {
          quote,
          contract,
          addTransaction,
          checkEthFlowOrderExists,
          addInFlightOrderId,
          uploadAppData,
          appData,
        }
      : null
  }, [appData, contract, quote, addTransaction, checkEthFlowOrderExists, addInFlightOrderId, uploadAppData])
}
