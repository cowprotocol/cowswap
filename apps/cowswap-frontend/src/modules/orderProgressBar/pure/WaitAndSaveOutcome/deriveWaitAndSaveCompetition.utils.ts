import { getAddressKey, type SolverSettlement } from '@cowprotocol/cow-sdk'
import { Fraction } from '@cowprotocol/currency'

import { SolverCompetition } from 'common/types/soverCompetition'

export interface PositiveAloneGain {
  /** Raw buy-token atoms of the best solution whose only order is this one. */
  bestAloneBuyAmount: bigint
  /** `winningBuyAmount - bestAloneBuyAmount`. Always greater than zero. */
  gainAmount: bigint
  /**
   * Gain as a percent of the alone buy. Missing when the alone buy is zero, so there is no baseline to divide by.
   */
  gainPercent: number | undefined
  /** Raw buy-token atoms this order receives on the winning solution. */
  winningBuyAmount: bigint
}

export interface WaitAndSaveCompetitionDerivation {
  /**
   * Other order UIDs on the winning solution.
   * `0` when that solution is only this order. Missing when no winning solution contains it.
   */
  companionCount: number | undefined
  /** A comparable solo bid exists, even when it does not beat the winning buy. */
  hasAloneBid: boolean
  positiveGain: PositiveAloneGain | undefined
  /** One row per solver address, winner first. Amounts are this order's fill on that solution. */
  solvers: SolverCompetition[]
}

type CompetitionOrder = NonNullable<SolverSettlement['orders']>[number]

interface OrderFill {
  buyAmount: bigint
  buyAmountRaw: string
  sellAmountRaw: string
}

interface RankedSolution {
  fill: OrderFill
  isWinner: boolean
  ranking: number | undefined
  solverAddress: string
}

export function buildSolverRankingRows(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
): SolverCompetition[] {
  return collectRankedSolutions(solutions, orderUid).map(toSolverCompetition)
}

export function deriveWaitAndSaveCompetition(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
): WaitAndSaveCompetitionDerivation {
  return {
    companionCount: getBatchCompanionCount(solutions, orderUid),
    hasAloneBid: hasAloneBid(solutions, orderUid),
    positiveGain: getPositiveAloneGain(solutions, orderUid),
    solvers: buildSolverRankingRows(solutions, orderUid),
  }
}

export function getBatchCompanionCount(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
): number | undefined {
  const winner = findWinningSolution(solutions, orderUid)
  if (!winner) return undefined

  return countOtherOrderUids(winner.orders, orderUid)
}

export function getPositiveAloneGain(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
): PositiveAloneGain | undefined {
  const winningBuyAmount = getWinningBuyAmount(solutions, orderUid)
  const bestAloneBuyAmount = findBestAloneBuy(solutions, orderUid)
  if (winningBuyAmount === undefined || bestAloneBuyAmount === undefined || winningBuyAmount <= bestAloneBuyAmount) {
    return undefined
  }

  return {
    bestAloneBuyAmount,
    gainAmount: winningBuyAmount - bestAloneBuyAmount,
    gainPercent: toGainPercent(winningBuyAmount - bestAloneBuyAmount, bestAloneBuyAmount),
    winningBuyAmount,
  }
}

export function hasAloneBid(solutions: readonly SolverSettlement[] | undefined, orderUid: string): boolean {
  return findBestAloneBuy(solutions, orderUid) !== undefined
}

function collectRankedSolutions(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
): RankedSolution[] {
  const bySolver = new Map<string, RankedSolution>()

  for (const solution of solutions ?? []) {
    rememberBetterSolution(bySolver, toRankedSolution(solution, orderUid))
  }

  return [...bySolver.values()].sort(compareSolverRows)
}

function compareByRanking(left: RankedSolution, right: RankedSolution): number {
  const leftRank = left.ranking ?? Number.POSITIVE_INFINITY
  const rightRank = right.ranking ?? Number.POSITIVE_INFINITY
  if (leftRank !== rightRank) return leftRank - rightRank
  if (left.fill.buyAmount === right.fill.buyAmount) return 0

  return left.fill.buyAmount > right.fill.buyAmount ? -1 : 1
}

function compareSolverRows(left: RankedSolution, right: RankedSolution): number {
  if (left.isWinner !== right.isWinner) return left.isWinner ? -1 : 1
  if (left.isWinner && left.fill.buyAmount !== right.fill.buyAmount) {
    return left.fill.buyAmount > right.fill.buyAmount ? -1 : 1
  }

  return compareByRanking(left, right)
}

function countOtherOrderUids(orders: SolverSettlement['orders'], orderUid: string): number {
  const others = new Set<string>()

  for (const order of orders ?? []) {
    if (!order.id || isSameOrderUid(order.id, orderUid)) continue
    others.add(order.id.toLowerCase())
  }

  return others.size
}

function findBestAloneBuy(solutions: readonly SolverSettlement[] | undefined, orderUid: string): bigint | undefined {
  let best: bigint | undefined

  for (const solution of solutions ?? []) {
    const buyAmount = getAloneBuyAmount(solution, orderUid)
    if (buyAmount === undefined) continue
    if (best === undefined || buyAmount > best) best = buyAmount
  }

  return best
}

function findOrder(solution: SolverSettlement, orderUid: string): CompetitionOrder | undefined {
  return solution.orders?.find((order) => isSameOrderUid(order.id, orderUid))
}

function findWinningSolution(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
): SolverSettlement | undefined {
  let winner: SolverSettlement | undefined

  for (const solution of solutions ?? []) {
    if (!isWinningSolution(solution, orderUid)) continue
    if (!winner || isPreferredWinner(solution, winner, orderUid)) winner = solution
  }

  return winner
}

function getAloneBuyAmount(solution: SolverSettlement, orderUid: string): bigint | undefined {
  if (!isCompetingSolution(solution) || !isAloneSolution(solution, orderUid)) return undefined

  return getOrderBuyAmount(solution, orderUid)
}

function getOrderBuyAmount(solution: SolverSettlement, orderUid: string): bigint | undefined {
  return parseUint(findOrder(solution, orderUid)?.buyAmount)
}

function getOrderFill(solution: SolverSettlement, orderUid: string): OrderFill | undefined {
  const order = findOrder(solution, orderUid)
  const buyAmountRaw = order?.buyAmount
  const sellAmountRaw = order?.sellAmount
  const buyAmount = parseUint(buyAmountRaw)
  if (buyAmount === undefined || buyAmountRaw === undefined || !isDecimalUint(sellAmountRaw)) return undefined

  return { buyAmount, buyAmountRaw, sellAmountRaw }
}

function getWinningBuyAmount(solutions: readonly SolverSettlement[] | undefined, orderUid: string): bigint | undefined {
  const winner = findWinningSolution(solutions, orderUid)
  if (!winner) return undefined

  return getOrderBuyAmount(winner, orderUid)
}

function isAloneSolution(solution: SolverSettlement, orderUid: string): boolean {
  const orders = solution.orders
  if (!orders?.length) return false

  return orders.every((order) => isSameOrderUid(order.id, orderUid))
}

function isBetterRanking(candidate: number | undefined, current: number | undefined): boolean {
  const candidateRank = candidate ?? Number.POSITIVE_INFINITY
  const currentRank = current ?? Number.POSITIVE_INFINITY

  return candidateRank < currentRank
}

// Filtered solutions are removed before a batch settles, so they are not an offer to beat or a ranking row.
function isCompetingSolution(solution: SolverSettlement): boolean {
  return solution.filteredOut !== true
}

function isDecimalUint(value: string | undefined): value is string {
  return value !== undefined && /^\d+$/.test(value)
}

function isPreferredWinner(candidate: SolverSettlement, current: SolverSettlement, orderUid: string): boolean {
  const candidateBuy = getOrderBuyAmount(candidate, orderUid)
  const currentBuy = getOrderBuyAmount(current, orderUid)
  if (candidateBuy === undefined) return false
  if (currentBuy === undefined || candidateBuy > currentBuy) return true
  if (candidateBuy < currentBuy) return false

  return isBetterRanking(candidate.ranking, current.ranking)
}

function isSameOrderUid(candidate: string | undefined, orderUid: string): boolean {
  if (!candidate) return false

  return candidate.toLowerCase() === orderUid.toLowerCase()
}

function isWinningSolution(solution: SolverSettlement, orderUid: string): boolean {
  return solution.isWinner === true && isCompetingSolution(solution) && solutionIncludesOrder(solution, orderUid)
}

function parseUint(value: string | undefined): bigint | undefined {
  if (!isDecimalUint(value)) return undefined

  return BigInt(value)
}

function rememberBetterSolution(bySolver: Map<string, RankedSolution>, ranked: RankedSolution | undefined): void {
  if (!ranked) return

  const current = bySolver.get(ranked.solverAddress)
  if (!current || compareSolverRows(ranked, current) < 0) bySolver.set(ranked.solverAddress, ranked)
}

function solutionIncludesOrder(solution: SolverSettlement, orderUid: string): boolean {
  return solution.orders?.some((order) => isSameOrderUid(order.id, orderUid)) ?? false
}

function toGainPercent(gainAmount: bigint, baselineBuyAmount: bigint): number | undefined {
  if (baselineBuyAmount <= 0n) return undefined

  const percent = Number(new Fraction(gainAmount, baselineBuyAmount).multiply(100).toSignificant(6))

  return Number.isFinite(percent) ? percent : undefined
}

function toRankedSolution(solution: SolverSettlement, orderUid: string): RankedSolution | undefined {
  if (!isCompetingSolution(solution) || !solution.solverAddress) return undefined

  const fill = getOrderFill(solution, orderUid)
  if (!fill) return undefined

  return {
    fill,
    isWinner: solution.isWinner === true,
    ranking: solution.ranking,
    solverAddress: getAddressKey(solution.solverAddress),
  }
}

function toSolverCompetition(ranked: RankedSolution): SolverCompetition {
  return {
    executedAmounts: { buy: ranked.fill.buyAmountRaw, sell: ranked.fill.sellAmountRaw },
    solver: ranked.solverAddress,
  }
}
