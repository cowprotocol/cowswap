import { useEffect, useMemo, useState } from 'react'

import { CHAIN_INFO, USDC_MAINNET } from '@cowprotocol/common-const'
import { formatTokenAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { Address, Hex, parseAbiItem } from 'viem'
import { usePublicClient } from 'wagmi'

import {
  AFFILIATE_PAYOUT_HISTORY_CHAIN_ID,
  AFFILIATE_PAYOUT_HISTORY_PAGE_BLOCK_RANGE,
  AFFILIATE_PAYOUT_HISTORY_ROW_LIMIT,
  AFFILIATE_PAYOUT_HISTORY_START_DATE,
  AFFILIATE_PAYOUT_SOURCE_AFFILIATE,
  AFFILIATE_PAYOUT_SOURCE_TRADER,
} from '../config/affiliateProgram.const'
import { AffiliatePayoutHistoryRole, PayoutHistoryRow } from '../lib/affiliateProgramTypes'

const TRANSFER_EVENT = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)')
const PAYOUT_SOURCE_BY_ROLE: Record<AffiliatePayoutHistoryRole, Address> = {
  affiliate: AFFILIATE_PAYOUT_SOURCE_AFFILIATE as Address,
  trader: AFFILIATE_PAYOUT_SOURCE_TRADER as Address,
}

interface TransferLog {
  transactionHash: Hex | null
  logIndex: number | null
  blockNumber: bigint | null
  args: {
    value?: bigint
  }
}

interface UsePayoutHistoryParams {
  account?: string
  role: AffiliatePayoutHistoryRole
}

interface UsePayoutHistoryResult {
  rows: PayoutHistoryRow[]
  loading: boolean
  error: boolean
}

function getStartTimestampSeconds(): bigint {
  const startDateMs = Date.parse(AFFILIATE_PAYOUT_HISTORY_START_DATE)

  if (Number.isNaN(startDateMs)) {
    return 0n
  }

  return BigInt(Math.floor(startDateMs / 1000))
}

async function findStartBlockAtOrAfterTimestamp(
  getBlock: (args: { blockNumber: bigint }) => Promise<{ timestamp: bigint }>,
  latestBlock: bigint,
  timestamp: bigint,
): Promise<bigint> {
  if (latestBlock <= 0n) {
    return 0n
  }

  const latest = await getBlock({ blockNumber: latestBlock })
  if (latest.timestamp < timestamp) {
    return latestBlock
  }

  let low = 0n
  let high = latestBlock

  while (low < high) {
    const mid = (low + high) / 2n
    const block = await getBlock({ blockNumber: mid })

    if (block.timestamp < timestamp) {
      low = mid + 1n
    } else {
      high = mid
    }
  }

  return low
}

function getLogKey(log: TransferLog): string {
  const txHash = log.transactionHash || ''
  const logIndex = log.logIndex?.toString() || ''

  return `${txHash}:${logIndex}`
}

function formatUsdcAmount(rawAmount: bigint): string {
  return formatTokenAmount(CurrencyAmount.fromRawAmount(USDC_MAINNET, rawAmount.toString()))
}

async function mapPayoutRows(params: {
  logs: TransferLog[]
  getBlock: (args: { blockNumber: bigint }) => Promise<{ timestamp: bigint }>
}): Promise<PayoutHistoryRow[]> {
  const { logs, getBlock } = params
  const sortedLogs = logs
    .filter((log) => Boolean(log.transactionHash && log.blockNumber !== null && log.blockNumber !== undefined))
    .sort((a, b) => {
      const blockDiff = Number((b.blockNumber || 0n) - (a.blockNumber || 0n))

      if (blockDiff !== 0) return blockDiff

      return Number((b.logIndex || 0) - (a.logIndex || 0))
    })
    .slice(0, AFFILIATE_PAYOUT_HISTORY_ROW_LIMIT)

  const blockNumbers = [
    ...new Set(sortedLogs.map((log) => log.blockNumber).filter((block): block is bigint => !!block)),
  ]
  const blockTimestamps = new Map<bigint, bigint>()

  await Promise.all(
    blockNumbers.map(async (blockNumber) => {
      const block = await getBlock({ blockNumber })
      blockTimestamps.set(blockNumber, block.timestamp)
    }),
  )

  return sortedLogs.reduce<PayoutHistoryRow[]>((acc, log) => {
    const txHash = log.transactionHash
    const blockNumber = log.blockNumber
    const value = log.args.value

    if (!txHash || !blockNumber || value === undefined) {
      return acc
    }

    const blockTimestamp = blockTimestamps.get(blockNumber)
    const date = blockTimestamp ? new Date(Number(blockTimestamp) * 1000).toISOString() : ''

    acc.push({
      date,
      amount: formatUsdcAmount(value),
      txHash,
      chainId: AFFILIATE_PAYOUT_HISTORY_CHAIN_ID,
    })

    return acc
  }, [])
}

async function fetchPayoutLogsByPage(params: {
  account: Address
  role: AffiliatePayoutHistoryRole
  getBlockNumber: () => Promise<bigint>
  getBlock: (args: { blockNumber: bigint }) => Promise<{ timestamp: bigint }>
  getLogs: (args: {
    address: Address
    event: typeof TRANSFER_EVENT
    args: { from: Address; to: Address }
    fromBlock: bigint
    toBlock: bigint
  }) => Promise<TransferLog[]>
}): Promise<TransferLog[]> {
  const { account, role, getBlockNumber, getBlock, getLogs } = params
  const payoutSource = PAYOUT_SOURCE_BY_ROLE[role]
  const latestBlock = await getBlockNumber()
  const startTimestamp = getStartTimestampSeconds()
  const startBlock = await findStartBlockAtOrAfterTimestamp(getBlock, latestBlock, startTimestamp)
  const seen = new Set<string>()
  const logs: TransferLog[] = []
  let toBlock = latestBlock

  while (toBlock >= startBlock && logs.length < AFFILIATE_PAYOUT_HISTORY_ROW_LIMIT) {
    const fromBlockCandidate =
      toBlock >= AFFILIATE_PAYOUT_HISTORY_PAGE_BLOCK_RANGE
        ? toBlock - AFFILIATE_PAYOUT_HISTORY_PAGE_BLOCK_RANGE + 1n
        : 0n
    const fromBlock = fromBlockCandidate < startBlock ? startBlock : fromBlockCandidate
    const page = await getLogs({
      address: USDC_MAINNET.address as Address,
      event: TRANSFER_EVENT,
      args: {
        from: payoutSource,
        to: account,
      },
      fromBlock,
      toBlock,
    })

    for (const log of page) {
      const key = getLogKey(log)

      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      logs.push(log)
    }

    if (fromBlock === startBlock) {
      break
    }

    toBlock = fromBlock - 1n
  }

  return logs
}

async function loadPayoutRows(params: {
  account: Address
  role: AffiliatePayoutHistoryRole
  getBlockNumber: () => Promise<bigint>
  getBlock: (args: { blockNumber: bigint }) => Promise<{ timestamp: bigint }>
  getLogs: (args: {
    address: Address
    event: typeof TRANSFER_EVENT
    args: { from: Address; to: Address }
    fromBlock: bigint
    toBlock: bigint
  }) => Promise<TransferLog[]>
}): Promise<PayoutHistoryRow[]> {
  const logs = await fetchPayoutLogsByPage(params)

  return mapPayoutRows({
    logs,
    getBlock: params.getBlock,
  })
}

const EMPTY_ROWS: PayoutHistoryRow[] = []

export function usePayoutHistory({ account, role }: UsePayoutHistoryParams): UsePayoutHistoryResult {
  const publicClient = usePublicClient({ chainId: AFFILIATE_PAYOUT_HISTORY_CHAIN_ID })
  const [rows, setRows] = useState<PayoutHistoryRow[]>(EMPTY_ROWS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!account || !publicClient) {
      setRows(EMPTY_ROWS)
      setLoading(false)
      setError(false)
      return
    }

    const load = async (): Promise<void> => {
      setLoading(true)
      setError(false)

      try {
        const nextRows = await loadPayoutRows({
          account: account as Address,
          role,
          getBlockNumber: () => publicClient.getBlockNumber(),
          getBlock: ({ blockNumber }) => publicClient.getBlock({ blockNumber }),
          getLogs: (args) =>
            publicClient.getLogs({
              address: args.address,
              event: args.event,
              args: args.args,
              fromBlock: args.fromBlock,
              toBlock: args.toBlock,
            }),
        })

        if (cancelled) {
          return
        }

        setRows(nextRows)
      } catch {
        if (cancelled) {
          return
        }

        setRows(EMPTY_ROWS)
        setError(true)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [account, publicClient, role])

  return useMemo(
    () => ({
      rows,
      loading,
      error,
    }),
    [rows, loading, error],
  )
}

export function getPayoutHistoryNetworkLabel(chainId: SupportedChainId): string {
  return CHAIN_INFO[chainId].label
}
