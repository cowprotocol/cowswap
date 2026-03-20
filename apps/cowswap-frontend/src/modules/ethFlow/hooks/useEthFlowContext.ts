import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useEthFlowContractData } from 'common/hooks/useContract'

import { useCheckEthFlowOrderExists } from './useCheckEthFlowOrderExists'

import { addInFlightOrderIdAtom } from '../state/ethFlowInFlightOrderIdsAtom'
import { EthFlowContext } from '../types'

export function useEthFlowContext(): EthFlowContext | null {
  const contract = useEthFlowContractData()
  const addTransaction = useTransactionAdder()

  const addInFlightOrderId = useSetAtom(addInFlightOrderIdAtom)

  const checkEthFlowOrderExists = useCheckEthFlowOrderExists()

  return useMemo(() => {
    return contract
      ? {
          contract,
          addTransaction,
          checkEthFlowOrderExists,
          addInFlightOrderId,
        }
      : null
  }, [contract, addTransaction, checkEthFlowOrderExists, addInFlightOrderId])
}
