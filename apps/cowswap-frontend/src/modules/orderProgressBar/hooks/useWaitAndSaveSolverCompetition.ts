import { useEffect, useState } from 'react'

import { normalizeError, withTimeout } from '@cowprotocol/common-utils'
import { SolverCompetitionResponse, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { getSolverCompetition, getTrades } from 'api/cowProtocol/api'

export type SolverCompetitionPollResult =
  | { competition: SolverCompetitionResponse; status: 'ready' }
  | { status: 'cancelled' }
  | { status: 'timedOut' }

export interface UseWaitAndSaveSolverCompetitionParams {
  chainId: SupportedChainId
  enabled: boolean
  orderUid: string | undefined
}

export interface WaitAndSaveSolverCompetitionState {
  competition: SolverCompetitionResponse | undefined
  pending: boolean
}

interface PollWaitAndSaveSolverCompetitionOptions {
  isCancelled: () => boolean
  now: () => number
  pollIntervalMs: number
  sleep: (ms: number) => Promise<void>
  timeoutMs: number
}

interface SettledSolverCompetition {
  competition: SolverCompetitionResponse | undefined
  key: string
}

interface SettlementTrade {
  blockNumber: number
  logIndex: number
  txHash: string | null
}

export const SOLVER_COMPETITION_POLL_INTERVAL_MS = ms`2s`
export const SOLVER_COMPETITION_POLL_TIMEOUT_MS = ms`20s`

const IDLE_STATE: WaitAndSaveSolverCompetitionState = { competition: undefined, pending: false }
const PENDING_STATE: WaitAndSaveSolverCompetitionState = { competition: undefined, pending: true }

export async function fetchWaitAndSaveSolverCompetition(
  chainId: SupportedChainId,
  orderUid: string,
): Promise<SolverCompetitionResponse | undefined> {
  try {
    const trades = await getTrades({ orderUid }, { chainId })
    const txHash = getLatestSettlementTxHash(trades)
    if (!txHash) return undefined
    return await getSolverCompetition(chainId, txHash)
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.debug('[fetchWaitAndSaveSolverCompetition] lookup failed', error.message)
    return undefined
  }
}

export function getLatestSettlementTxHash(trades: readonly SettlementTrade[]): string | undefined {
  let latest: SettlementTrade | undefined

  for (const trade of trades) {
    if (!trade.txHash) continue
    if (!latest || isLaterSettlementTrade(trade, latest)) {
      latest = trade
    }
  }

  return latest?.txHash || undefined
}

export async function pollWaitAndSaveSolverCompetition(
  fetchOnce: () => Promise<SolverCompetitionResponse | undefined>,
  options: PollWaitAndSaveSolverCompetitionOptions,
): Promise<SolverCompetitionPollResult> {
  const { isCancelled, now, pollIntervalMs, sleep, timeoutMs } = options
  const deadline = now() + timeoutMs

  while (!isCancelled() && now() < deadline) {
    const competition = await readSolverCompetitionAttempt(fetchOnce, deadline - now())
    if (isCancelled()) return { status: 'cancelled' }
    if (competition) return { competition, status: 'ready' }

    const pause = Math.min(pollIntervalMs, deadline - now())
    if (pause <= 0) break
    await sleep(pause)
  }

  if (isCancelled()) return { status: 'cancelled' }
  return { status: 'timedOut' }
}

export function useWaitAndSaveSolverCompetition(
  params: UseWaitAndSaveSolverCompetitionParams,
): WaitAndSaveSolverCompetitionState {
  const { chainId, enabled, orderUid } = params
  const requestKey = enabled && orderUid ? `${chainId}:${orderUid}` : undefined
  const [trackedKey, setTrackedKey] = useState(requestKey)
  const [settled, setSettled] = useState<SettledSolverCompetition>()

  if (trackedKey !== requestKey) {
    setTrackedKey(requestKey)
    setSettled(undefined)
  }

  useEffect(() => {
    if (!requestKey || !orderUid) return

    return startWaitAndSaveSolverCompetitionPoll({
      chainId,
      onSettled: setSettled,
      orderUid,
      requestKey,
    })
  }, [chainId, orderUid, requestKey])

  return selectWaitAndSaveSolverCompetitionState(requestKey, trackedKey, settled)
}

function isLaterSettlementTrade(candidate: SettlementTrade, current: SettlementTrade): boolean {
  if (candidate.blockNumber !== current.blockNumber) {
    return candidate.blockNumber > current.blockNumber
  }
  return candidate.logIndex > current.logIndex
}

async function readSolverCompetitionAttempt(
  fetchOnce: () => Promise<SolverCompetitionResponse | undefined>,
  remainingMs: number,
): Promise<SolverCompetitionResponse | undefined> {
  try {
    return await withTimeout(fetchOnce(), {
      timeout: remainingMs,
      timeoutMessage: 'Solver competition lookup timed out',
    })
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.debug('[pollWaitAndSaveSolverCompetition] attempt failed', error.message)
    return undefined
  }
}

function selectWaitAndSaveSolverCompetitionState(
  requestKey: string | undefined,
  trackedKey: string | undefined,
  settled: SettledSolverCompetition | undefined,
): WaitAndSaveSolverCompetitionState {
  if (!requestKey) return IDLE_STATE
  if (trackedKey !== requestKey || !settled || settled.key !== requestKey) return PENDING_STATE
  return { competition: settled.competition, pending: false }
}

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}

function startWaitAndSaveSolverCompetitionPoll(params: {
  chainId: SupportedChainId
  onSettled: (settled: SettledSolverCompetition) => void
  orderUid: string
  requestKey: string
}): () => void {
  let cancelled = false
  const { chainId, onSettled, orderUid, requestKey } = params

  void pollWaitAndSaveSolverCompetition(() => fetchWaitAndSaveSolverCompetition(chainId, orderUid), {
    isCancelled: () => cancelled,
    now: Date.now,
    pollIntervalMs: SOLVER_COMPETITION_POLL_INTERVAL_MS,
    sleep,
    timeoutMs: SOLVER_COMPETITION_POLL_TIMEOUT_MS,
  }).then(
    (result) => {
      if (cancelled || result.status === 'cancelled') return
      onSettled({
        competition: result.status === 'ready' ? result.competition : undefined,
        key: requestKey,
      })
    },
    (err: unknown) => {
      const error = normalizeError(err)
      console.debug('[useWaitAndSaveSolverCompetition] lookup failed', error.message)
      if (cancelled) return
      onSettled({ competition: undefined, key: requestKey })
    },
  )

  return () => {
    cancelled = true
  }
}
