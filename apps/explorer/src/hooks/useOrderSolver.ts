import { useEffect, useMemo, useState } from 'react'

import { useNetworkId } from 'state/network'

import { getOrderCompetitionStatus, Order, OrderCompetitionStatus } from 'api/operator'

import { fetchSolversInfo } from '../utils/fetchSolversInfo'

export type OrderSolverInfo = {
  solverId: string
  displayName: string
  image?: string
}

type UseOrderSolverResult = {
  solver: OrderSolverInfo | undefined
  isLoading: boolean
}

const SOLVER_SUFFIX_REGEX = /-solve$/i

function normalizeSolverId(solverId: string): string {
  return solverId.trim().toLowerCase().replace(SOLVER_SUFFIX_REGEX, '')
}

function getWinnerSolver(value?: OrderCompetitionStatus['value']): string | undefined {
  if (!value?.length) return undefined

  const executedSolvers = value.filter((solver) => !!solver.executedAmounts)
  const winner = executedSolvers[executedSolvers.length - 1] || value[value.length - 1]

  return winner?.solver
}

export function useOrderSolver(order: Order | null): UseOrderSolverResult {
  const networkId = useNetworkId()
  const [solver, setSolver] = useState<OrderSolverInfo | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!networkId || !order?.uid) {
      setSolver(undefined)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    Promise.all([
      getOrderCompetitionStatus({ networkId, orderId: order.uid }),
      fetchSolversInfo(networkId).catch(() => []),
    ])
      .then(([competitionStatus, solvers]) => {
        if (cancelled) return

        const winnerSolver = getWinnerSolver(competitionStatus?.value)

        if (!winnerSolver) {
          setSolver(undefined)
          return
        }

        const normalizedWinnerSolverId = normalizeSolverId(winnerSolver)
        const matchingSolver = solvers.find((candidate) => {
          const normalizedSolverId = normalizeSolverId(candidate.solverId)
          const normalizedDisplayName = normalizeSolverId(candidate.displayName)
          return normalizedSolverId === normalizedWinnerSolverId || normalizedDisplayName === normalizedWinnerSolverId
        })

        setSolver({
          solverId: matchingSolver?.solverId || winnerSolver,
          displayName: matchingSolver?.displayName || winnerSolver,
          image: matchingSolver?.image,
        })
      })
      .catch(() => {
        if (cancelled) return
        setSolver(undefined)
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })

    return (): void => {
      cancelled = true
    }
  }, [networkId, order?.uid])

  return useMemo(() => ({ solver, isLoading }), [solver, isLoading])
}
