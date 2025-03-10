import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useAppData, useUploadAppData } from 'modules/appData'
import { useTradeQuote } from 'modules/tradeQuote'

import { useEthFlowContract } from 'common/hooks/useContract'

import { useCheckEthFlowOrderExists } from './useCheckEthFlowOrderExists'

import { addInFlightOrderIdAtom } from '../state/ethFlowInFlightOrderIdsAtom'
import { EthFlowContext } from '../types'

export function useEthFlowContext(): EthFlowContext | null {
  const {
    result: { contract },
  } = useEthFlowContract()
  // TODO: bind Swap module to tradeQuote module
  const quote = useTradeQuote()

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
