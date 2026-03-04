import { useEffect, useMemo, useState } from 'react'

import { useNetworkId } from 'state/network'

import {
  getOrderCompetitionStatus,
  getSolverCompetitionByTxHash,
  Order,
  OrderCompetitionStatus,
  SolverCompetitionResponse,
} from 'api/operator'

import { SolverInfo, fetchSolversInfo } from '../utils/fetchSolversInfo'

export type OrderSolverInfo = {
  solverId: string
  displayName: string
  image?: string
}

export type UseOrderSolverResult = {
  solver: OrderSolverInfo | undefined
  isLoading: boolean
}

export function useTradeSolver(txHash: string | undefined | null): UseOrderSolverResult {
  const networkId = useNetworkId()
  const [solver, setSolver] = useState<OrderSolverInfo | undefined>()
  const [doneFor, setDoneFor] = useState<string | null>(null)

  const currentKey = txHash && networkId ? `${networkId}:${txHash}` : null

  useEffect(() => {
    if (!networkId || !txHash || !currentKey) {
      setSolver(undefined)
      setDoneFor(null)
      return
    }

    let cancelled = false

    resolveSolverByTxHash(networkId, txHash)
      .then((result) => {
        if (cancelled) return
        setSolver(result)
        setDoneFor(currentKey)
      })
      .catch(() => {
        if (cancelled) return
        setSolver(undefined)
        setDoneFor(currentKey)
      })

    return () => {
      cancelled = true
    }
  }, [networkId, txHash, currentKey])

  const isLoading = !!currentKey && !!networkId && doneFor !== currentKey

  return useMemo(() => ({ solver, isLoading }), [solver, isLoading])
}

export function useOrderSolver(order: Order | null): UseOrderSolverResult {
  const networkId = useNetworkId()
  const [solver, setSolver] = useState<OrderSolverInfo | undefined>()
  // Tracks which orderUid:txHash combo we finished resolving
  const [doneFor, setDoneFor] = useState<string | null>(null)

  const orderUid = order?.uid
  const txHash = order?.txHash
  const currentKey = orderUid && networkId ? `${networkId}:${orderUid}:${txHash || ''}` : null

  useEffect(() => {
    if (!networkId || !orderUid || !currentKey) {
      setSolver(undefined)
      setDoneFor(null)
      return
    }

    let cancelled = false

    resolveSolver(networkId, orderUid, txHash)
      .then((result) => {
        if (cancelled) return

        setSolver(result)
        setDoneFor(currentKey)
      })
      .catch(() => {
        if (cancelled) return
        setSolver(undefined)
        setDoneFor(currentKey)
      })

    return () => {
      cancelled = true
    }
  }, [networkId, orderUid, txHash, currentKey])

  // Loading if we have an order, a network, and haven't finished resolving for the current key
  const isLoading = !!currentKey && !!networkId && doneFor !== currentKey

  return useMemo(() => ({ solver, isLoading }), [solver, isLoading])
}

const SOLVER_SUFFIX_REGEX = /-solve$/i

function normalizeSolverId(solverId: string): string {
  return solverId.trim().toLowerCase().replace(SOLVER_SUFFIX_REGEX, '')
}

function getWinnerSolver(value?: OrderCompetitionStatus['value']): string | undefined {
  if (!value?.length) return undefined

  const executedSolvers = value.filter((solver) => !!solver.executedAmounts)
  const winner = executedSolvers[executedSolvers.length - 1]

  return winner?.solver
}

function getWinnerSolverFromCompetition(competition?: SolverCompetitionResponse): string | undefined {
  if (!competition?.solutions?.length) return undefined

  const winner = competition.solutions.find((s) => s.isWinner)
  if (!winner) return undefined

  return getWinnerSolverName(winner)
}

function getWinnerSolverName(winner: unknown): string | undefined {
  if (!winner || typeof winner !== 'object' || !('solver' in winner)) return undefined

  const solver = winner.solver
  return typeof solver === 'string' ? solver : undefined
}

function matchSolverByName(solverName: string, solvers: SolverInfo[]): SolverInfo | undefined {
  const normalizedName = normalizeSolverId(solverName)
  return solvers.find((candidate) => {
    const normalizedSolverId = normalizeSolverId(candidate.solverId)
    const normalizedDisplayName = normalizeSolverId(candidate.displayName)
    return normalizedSolverId === normalizedName || normalizedDisplayName === normalizedName
  })
}

function buildSolverInfo(winnerSolverName: string, solvers: SolverInfo[]): OrderSolverInfo {
  const matchingSolver = matchSolverByName(winnerSolverName, solvers)
  return {
    solverId: matchingSolver?.solverId || winnerSolverName,
    displayName: matchingSolver?.displayName || winnerSolverName,
    image: matchingSolver?.image,
  }
}

async function resolveSolver(
  networkId: number,
  orderUid: string,
  txHash: string | undefined,
): Promise<OrderSolverInfo | undefined> {
  const [competitionStatus, solvers] = await Promise.all([
    getOrderCompetitionStatus({ networkId, orderId: orderUid }),
    fetchSolversInfo(networkId).catch(() => []),
  ])

  const winnerFromOrder = getWinnerSolver(competitionStatus?.value)

  // Fallback: try fetching solver competition by txHash when per-order endpoint has no data
  const winnerSolverName =
    winnerFromOrder ||
    (txHash ? getWinnerSolverFromCompetition(await getSolverCompetitionByTxHash({ networkId, txHash })) : undefined)

  if (!winnerSolverName) return undefined

  return buildSolverInfo(winnerSolverName, solvers)
}

async function resolveSolverByTxHash(networkId: number, txHash: string): Promise<OrderSolverInfo | undefined> {
  const [competition, solvers] = await Promise.all([
    getSolverCompetitionByTxHash({ networkId, txHash }),
    fetchSolversInfo(networkId).catch(() => []),
  ])

  const winnerSolverName = getWinnerSolverFromCompetition(competition)
  if (!winnerSolverName) return undefined

  return buildSolverInfo(winnerSolverName, solvers)
}
