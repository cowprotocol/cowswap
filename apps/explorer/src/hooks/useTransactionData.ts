import { useCallback, useEffect, useMemo, useState } from 'react'

import { Network } from 'types'

import { getTransactionContracts, getTransactionTrace } from 'api/tenderly'
import { Contract, Trace } from 'api/tenderly/types'

type LoadingData<T> = {
  data: T
  isLoading: boolean
  error: string
}

const TRACE_CACHE = new Map<string, Trace>()

function getCachedData<T>(key: string, cache: Map<string, T>): T | undefined {
  return cache.get(key)
}

function useTransactionTrace(network: Network | undefined, txHash: string): LoadingData<Trace | undefined> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [trace, setTrace] = useState<Trace | undefined>()

  const fetchTrace = useCallback(async (network: Network, _txHash: string): Promise<void> => {
    setIsLoading(true)
    setError('')
    try {
      const cacheKey = `${network}-${_txHash}`
      const cachedData = getCachedData(cacheKey, TRACE_CACHE)

      if (cachedData) {
        setTrace(cachedData)
      } else {
        const trace = await getTransactionTrace(network, _txHash)

        setTrace(trace)
        TRACE_CACHE.set(cacheKey, trace)
      }
    } catch (e) {
      setError(e.message)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (txHash && network) {
      fetchTrace(network, txHash)
    }
  }, [network, txHash, fetchTrace])

  return useMemo(() => ({ data: trace, isLoading, error }), [trace, isLoading, error])
}

const CONTRACTS_CACHE = new Map<string, Contract[]>()

function useTransactionContracts(network: Network | undefined, txHash: string): LoadingData<Contract[]> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [contracts, setContracts] = useState<Contract[]>([])

  const fetchContracts = useCallback(async (network: Network, _txHash: string): Promise<void> => {
    setIsLoading(true)
    setError('')
    try {
      const cacheKey = `${network}-${_txHash}`
      const cachedData = getCachedData(cacheKey, CONTRACTS_CACHE)

      if (cachedData) {
        setContracts(cachedData)
      } else {
        const contracts = await getTransactionContracts(network, _txHash)

        setContracts(contracts)
        CONTRACTS_CACHE.set(cacheKey, contracts)
      }
    } catch (e) {
      setError(e.message)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (txHash && network) {
      fetchContracts(network, txHash)
    }
  }, [network, txHash, fetchContracts])

  return useMemo(() => ({ data: contracts, isLoading, error }), [contracts, isLoading, error])
}

export type TransactionData = {
  trace: Trace | undefined
  contracts: Contract[]
  isLoading: boolean
  error: string
}

export function useTransactionData(network: Network | undefined, txHash: string): TransactionData {
  const traceData = useTransactionTrace(network, txHash)
  const contractsData = useTransactionContracts(network, txHash)

  return useMemo(
    () => ({
      trace: traceData.data,
      contracts: contractsData.data,
      isLoading: traceData.isLoading || contractsData.isLoading,
      error: traceData.error || contractsData.error,
    }),
    [
      traceData.data,
      contractsData.data,
      traceData.isLoading,
      contractsData.isLoading,
      traceData.error,
      contractsData.error,
    ]
  )
}
