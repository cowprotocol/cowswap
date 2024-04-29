import { useCallback, useEffect, useState } from 'react'

import { gql } from '@apollo/client'

import { subgraphApiSDK } from '../../../cowSdk'
import { useNetworkId } from '../../../state/network'
import { Network } from '../../../types'

export interface BatchInfo {
  lastBatchDate: Date
  batchId: string
}

interface PastAndPresentValue {
  now: number
  before: number
}

interface TotalSummary {
  batchInfo?: BatchInfo
  dailyTransactions?: PastAndPresentValue
  totalTokens?: number
  dailyFees?: PastAndPresentValue
  volumeUsd?: number
}

type SummaryQuery = {
  settlements: Array<{ firstTradeTimestamp: string; txHash: string }>
  hourlyTotals: Array<{ orders: string; feesUsd: string }>
  totals: Array<{ tokens: string; volumeUsd: string }>
}

function buildSummary(data: SummaryQuery): TotalSummary {
  const batchInfo: BatchInfo = {
    lastBatchDate: new Date(Number(data.settlements[0].firstTradeTimestamp) * 1000),
    batchId: data.settlements[0].txHash,
  }

  const now = getTransactionsAndFees(data.hourlyTotals.slice(0, 24))
  const before = getTransactionsAndFees(data.hourlyTotals.slice(24, 48))

  const dailyTransactions: PastAndPresentValue = {
    before: before.transactions,
    now: now.transactions,
  }

  const dailyFees: PastAndPresentValue = {
    before: before.fees,
    now: now.fees,
  }

  const totalTokens = Number(data.totals[0].tokens)
  const volumeUsd = Number(data.totals[0].volumeUsd)

  return {
    batchInfo,
    dailyTransactions,
    dailyFees,
    totalTokens,
    volumeUsd,
  }
}

function getTransactionsAndFees(data: Array<{ orders: string; feesUsd: string }>): TransactionsAndFees {
  return data.reduce(
    (acc, curr) => {
      acc.transactions += Number(curr.orders)
      acc.fees += Number(curr.feesUsd)
      return acc
    },
    { fees: 0, transactions: 0 }
  )
}

type TransactionsAndFees = {
  transactions: number
  fees: number
}

export type TotalSummaryResponse = TotalSummary & {
  isLoading: boolean
}

const FETCH_INTERVAL = 1000 * 10 // 10 seconds

export function useGetSummaryData(): TotalSummaryResponse | undefined {
  const [summary, setSummary] = useState<TotalSummaryResponse | undefined>()
  const network = useNetworkId() ?? Network.MAINNET

  const fetchAndBuildSummary = useCallback(async () => {
    setSummary((summary) => ({ ...summary, isLoading: true }))
    subgraphApiSDK.runQuery<SummaryQuery>(summaryQuery, undefined, { chainId: network }).then((data) => {
      const summary = buildSummary(data)
      setSummary({ ...summary, isLoading: false })
    })
  }, [network])

  useEffect(() => {
    fetchAndBuildSummary()

    const id = setInterval(() => {
      fetchAndBuildSummary()
    }, FETCH_INTERVAL)

    return (): void => clearInterval(id)
  }, [fetchAndBuildSummary])

  return summary
}

const summaryQuery = gql`
  query Summary {
    hourlyTotals(orderBy: timestamp, orderDirection: desc, first: 48) {
      orders
      feesUsd
    }
    settlements(orderBy: firstTradeTimestamp, orderDirection: desc, first: 1) {
      txHash
      firstTradeTimestamp
    }
    totals {
      tokens
      volumeUsd
    }
  }
`
