import {
  getOrderCompetitionStatus,
  getSolverCompetitionByTxHash,
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

const SOLVER_SUFFIX_REGEX = /-solve$/i
type CompetitionStatusEntry = NonNullable<OrderCompetitionStatus['value']>[number]
type ExecutedAmounts = NonNullable<CompetitionStatusEntry['executedAmounts']>

export async function resolveSolver(
  networkId: number,
  orderUid: string,
  txHash: string | undefined,
): Promise<OrderSolverInfo | undefined> {
  // Solver branding is global metadata. Do not scope this by network, because CMS network mappings can lag
  // behind the competition winner data and would hide valid logos/display names on order and fill views.
  const [competitionStatus, solvers] = await Promise.all([
    getOrderCompetitionStatus({ networkId, orderId: orderUid }),
    fetchSolversInfo().catch(() => []),
  ])

  const winnerFromOrder = getWinnerSolver(competitionStatus?.value)

  const winnerSolverName =
    winnerFromOrder ||
    (txHash ? getWinnerSolverFromCompetition(await getSolverCompetitionByTxHash({ networkId, txHash })) : undefined)

  if (!winnerSolverName) return undefined

  return buildSolverInfo(winnerSolverName, solvers)
}

export async function resolveSolverByTxHash(networkId: number, txHash: string): Promise<OrderSolverInfo | undefined> {
  const [competition, solvers] = await Promise.all([
    getSolverCompetitionByTxHash({ networkId, txHash }),
    fetchSolversInfo().catch(() => []),
  ])

  const winnerSolverName = getWinnerSolverFromCompetition(competition)
  if (!winnerSolverName) return undefined

  return buildSolverInfo(winnerSolverName, solvers)
}

function buildSolverInfo(winnerSolverName: string, solvers: SolverInfo[]): OrderSolverInfo {
  const matchingSolver = matchSolverByName(winnerSolverName, solvers)
  return {
    solverId: matchingSolver?.solverId || winnerSolverName,
    displayName: matchingSolver?.displayName || winnerSolverName,
    image: matchingSolver?.image,
  }
}

function getWinnerSolver(value?: OrderCompetitionStatus['value']): string | undefined {
  if (!value?.length) return undefined

  const executedSolvers = value.filter((solver) => hasNonZeroExecutedAmounts(solver.executedAmounts))
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

function hasNonZeroExecutedAmounts(executedAmounts: CompetitionStatusEntry['executedAmounts']): boolean {
  if (!executedAmounts) return false

  return isNonZeroAmount(executedAmounts.buy) || isNonZeroAmount(executedAmounts.sell)
}

function isNonZeroAmount(value: ExecutedAmounts['buy']): boolean {
  try {
    return BigInt(value) > 0n
  } catch {
    return false
  }
}

function matchSolverByName(solverName: string, solvers: SolverInfo[]): SolverInfo | undefined {
  const normalizedName = normalizeSolverId(solverName)
  return solvers.find((candidate) => {
    const normalizedSolverId = normalizeSolverId(candidate.solverId)
    const normalizedDisplayName = normalizeSolverId(candidate.displayName)
    return normalizedSolverId === normalizedName || normalizedDisplayName === normalizedName
  })
}

function normalizeSolverId(solverId: string): string {
  return solverId.trim().toLowerCase().replace(SOLVER_SUFFIX_REGEX, '')
}
