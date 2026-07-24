import { shortenAddress } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import {
  getOrderCompetitionStatus,
  getSolverCompetitionByTxHash,
  OrderCompetitionStatus,
  SolverCompetitionResponse,
} from 'api/operator'

import { fetchSolversInfo, SolverInfo } from '../utils/fetchSolversInfo'

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
    (txHash
      ? getWinnerSolverFromCompetition(await getSolverCompetitionByTxHash({ networkId, txHash }), solvers, orderUid)
      : undefined)

  if (!winnerSolverName) return undefined

  return buildSolverInfo(winnerSolverName, solvers)
}

export async function resolveSolverByTxHash(
  networkId: number,
  txHash: string,
  orderId: string,
): Promise<OrderSolverInfo | undefined> {
  const [competition, solvers] = await Promise.all([
    getSolverCompetitionByTxHash({ networkId, txHash }),
    fetchSolversInfo().catch(() => []),
  ])

  const winnerSolverName = getWinnerSolverFromCompetition(competition, solvers, orderId)

  if (!winnerSolverName) return undefined

  return buildSolverInfo(winnerSolverName, solvers)
}

function buildSolverInfo(winnerSolver: string, solvers: SolverInfo[]): OrderSolverInfo {
  // Once the backend migrates, the competition `solver` field carries the on-chain solver address
  // instead of the name. Resolve CMS branding by address in that case; otherwise fall back to the
  // legacy name-based lookup (backend still returns a name, e.g. `naive`, `barter-solve`).
  return isSolverAddress(winnerSolver)
    ? buildSolverInfoFromAddress(winnerSolver, solvers)
    : buildSolverInfoFromName(winnerSolver, solvers)
}

function buildSolverInfoFromAddress(address: string, solvers: SolverInfo[]): OrderSolverInfo {
  const matchingSolver = matchSolverByAddress(address, solvers)
  return {
    solverId: matchingSolver?.solverId || address,
    // When the address isn't found in CMS, fall back to a shortened address for display so the
    // full 42-char address doesn't break the UI layout.
    displayName: matchingSolver?.displayName || shortenAddress(address),
    image: matchingSolver?.image,
  }
}

function buildSolverInfoFromName(solverName: string, solvers: SolverInfo[]): OrderSolverInfo {
  const matchingSolver = matchSolverByName(solverName, solvers)
  return {
    solverId: matchingSolver?.solverId || solverName,
    displayName: matchingSolver?.displayName || solverName,
    image: matchingSolver?.image,
  }
}

function getWinnerSolver(value?: OrderCompetitionStatus['value']): string | undefined {
  if (!value?.length) return undefined

  const executedSolvers = value.filter((solver) => hasNonZeroExecutedAmounts(solver.executedAmounts))
  const winner = executedSolvers[executedSolvers.length - 1]

  return winner?.solver
}

function getWinnerSolverFromCompetition(
  competition?: SolverCompetitionResponse,
  solvers?: SolverInfo[],
  orderId?: string,
): string | undefined {
  if (!competition?.solutions?.length || !solvers?.length || !orderId) return undefined

  const winner = competition.solutions.find((s) => s.isWinner && s.orders?.find((o) => o?.id === orderId))
  if (!winner) return undefined

  return getWinnerSolverName(winner, solvers)
}

function getWinnerSolverName(winner: unknown, solvers: SolverInfo[]): string | undefined {
  if (!winner || typeof winner !== 'object' || !('solverAddress' in winner)) return undefined

  const solverAddress = winner.solverAddress

  if (typeof solverAddress === 'string') {
    return matchSolverByAddress(solverAddress, solvers)?.displayName ?? undefined
  }
  return undefined
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

function isSolverAddress(value: string): boolean {
  return value.startsWith('0x') && value.length === 42
}

function matchSolverByAddress(address: string, solvers: SolverInfo[]): SolverInfo | undefined {
  return solvers.find((candidate) => candidate.deployments.some((d) => areAddressesEqual(d.address, address)))
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
