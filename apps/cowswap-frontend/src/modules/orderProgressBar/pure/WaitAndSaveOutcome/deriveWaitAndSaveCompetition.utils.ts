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

/**
 * Builds one UI ranking row per solver that included this order, winner first.
 */
export function buildSolverRankingRows(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
): SolverCompetition[] {
  return collectRankedSolutions(solutions, orderUid).map(toSolverCompetition)
}

/**
 * Derives everything Wait & Save needs from one auction's solver settlements for `orderUid`:
 * batch companions on the winner, whether a same-sell alone bid exists, positive CoW gain vs that bid,
 * and winner-first solver ranking rows.
 */
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

/**
 * Counts distinct other order UIDs on the winning solution that includes this order.
 * `undefined` when there is no such winner.
 */
export function getBatchCompanionCount(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
): number | undefined {
  const winner = findWinningSolution(solutions, orderUid)
  if (!winner) return undefined

  return countOtherOrderUids(winner.orders, orderUid)
}

/**
 * Positive CoW gain when the winning fill buys more than the best alone bid with the same sell amount.
 * Flow: resolve winning fill → best same-sell alone buy → return delta only when winning buy is strictly higher.
 */
export function getPositiveAloneGain(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
): PositiveAloneGain | undefined {
  const winningFill = getWinningOrderFill(solutions, orderUid)
  if (!winningFill) return undefined

  // Alone baseline must use the same sell fill as the winner; otherwise buy deltas are not comparable
  // (e.g. a partial alone fill vs a full winning fill).
  const bestAloneBuyAmount = findBestAloneBuy(solutions, orderUid, winningFill.sellAmountRaw)
  // No CoW gain unless the batch buy strictly beats that same-sell alone offer.
  if (bestAloneBuyAmount === undefined || winningFill.buyAmount <= bestAloneBuyAmount) {
    return undefined
  }

  return {
    bestAloneBuyAmount,
    gainAmount: winningFill.buyAmount - bestAloneBuyAmount,
    gainPercent: toGainPercent(winningFill.buyAmount - bestAloneBuyAmount, bestAloneBuyAmount),
    winningBuyAmount: winningFill.buyAmount,
  }
}

/**
 * Whether any competing alone solution matches the winning fill's sell amount for this order.
 */
export function hasAloneBid(solutions: readonly SolverSettlement[] | undefined, orderUid: string): boolean {
  const winningFill = getWinningOrderFill(solutions, orderUid)
  if (!winningFill) return false

  return findBestAloneBuy(solutions, orderUid, winningFill.sellAmountRaw) !== undefined
}

/**
 * Dedupes competing solutions by solver address (keeping the better row) and sorts winner-first.
 */
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

/** Sort key: lower auction ranking first, then higher buy amount. */
function compareByRanking(left: RankedSolution, right: RankedSolution): number {
  const leftRank = left.ranking ?? Number.POSITIVE_INFINITY
  const rightRank = right.ranking ?? Number.POSITIVE_INFINITY
  if (leftRank !== rightRank) return leftRank - rightRank
  if (left.fill.buyAmount === right.fill.buyAmount) return 0

  return left.fill.buyAmount > right.fill.buyAmount ? -1 : 1
}

/** Sort key: winners before non-winners; among winners prefer higher buy, else ranking. */
function compareSolverRows(left: RankedSolution, right: RankedSolution): number {
  if (left.isWinner !== right.isWinner) return left.isWinner ? -1 : 1
  if (left.isWinner && left.fill.buyAmount !== right.fill.buyAmount) {
    return left.fill.buyAmount > right.fill.buyAmount ? -1 : 1
  }

  return compareByRanking(left, right)
}

/** Distinct order UIDs on the solution other than `orderUid`. */
function countOtherOrderUids(orders: SolverSettlement['orders'], orderUid: string): number {
  const others = new Set<string>()

  for (const order of orders ?? []) {
    if (!order.id || isSameOrderUid(order.id, orderUid)) continue
    others.add(order.id.toLowerCase())
  }

  return others.size
}

/**
 * Highest alone-solution buy for this order among competing bids that sold exactly `requiredSellAmount`.
 */
function findBestAloneBuy(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
  requiredSellAmount: string,
): bigint | undefined {
  let best: bigint | undefined

  for (const solution of solutions ?? []) {
    const buyAmount = getAloneBuyAmount(solution, orderUid, requiredSellAmount)
    if (buyAmount === undefined) continue
    if (best === undefined || buyAmount > best) best = buyAmount
  }

  return best
}

/** Locates this order on a solution's order list. */
function findOrder(solution: SolverSettlement, orderUid: string): CompetitionOrder | undefined {
  return solution.orders?.find((order) => isSameOrderUid(order.id, orderUid))
}

/**
 * Competing winning solution that includes this order.
 * If several winners do, prefers the higher buy for this order, then better ranking.
 */
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

/**
 * Buy amount when the solution is a competing alone bid for this order with the required sell fill.
 */
function getAloneBuyAmount(
  solution: SolverSettlement,
  orderUid: string,
  requiredSellAmount: string,
): bigint | undefined {
  if (!isCompetingSolution(solution) || !isAloneSolution(solution, orderUid)) return undefined

  const fill = getOrderFill(solution, orderUid)
  if (!fill || fill.sellAmountRaw !== requiredSellAmount) return undefined

  return fill.buyAmount
}

/** Parsed buy atoms for this order on the solution, if present and valid. */
function getOrderBuyAmount(solution: SolverSettlement, orderUid: string): bigint | undefined {
  return parseUint(findOrder(solution, orderUid)?.buyAmount)
}

/** Parsed buy/sell fill for this order; requires decimal uint atom strings. */
function getOrderFill(solution: SolverSettlement, orderUid: string): OrderFill | undefined {
  const order = findOrder(solution, orderUid)
  const buyAmountRaw = order?.buyAmount
  const sellAmountRaw = order?.sellAmount
  const buyAmount = parseUint(buyAmountRaw)
  if (buyAmount === undefined || buyAmountRaw === undefined || !isDecimalUint(sellAmountRaw)) return undefined

  return { buyAmount, buyAmountRaw, sellAmountRaw }
}

/** Fill of this order on the preferred winning solution, if any. */
function getWinningOrderFill(
  solutions: readonly SolverSettlement[] | undefined,
  orderUid: string,
): OrderFill | undefined {
  const winner = findWinningSolution(solutions, orderUid)
  if (!winner) return undefined

  return getOrderFill(winner, orderUid)
}

/** True when every order on the solution is this order (solo bid). */
function isAloneSolution(solution: SolverSettlement, orderUid: string): boolean {
  const orders = solution.orders
  if (!orders?.length) return false

  return orders.every((order) => isSameOrderUid(order.id, orderUid))
}

/** Lower ranking number wins; missing ranking sorts last. */
function isBetterRanking(candidate: number | undefined, current: number | undefined): boolean {
  const candidateRank = candidate ?? Number.POSITIVE_INFINITY
  const currentRank = current ?? Number.POSITIVE_INFINITY

  return candidateRank < currentRank
}

/**
 * Solutions still in the auction. Filtered-out entries are dropped before settlement,
 * so they are neither an alone baseline nor a ranking row.
 */
function isCompetingSolution(solution: SolverSettlement): boolean {
  return solution.filteredOut !== true
}

/** Non-empty decimal digit string suitable for `BigInt`. */
function isDecimalUint(value: string | undefined): value is string {
  return value !== undefined && /^\d+$/.test(value)
}

/**
 * Whether `candidate` should replace `current` as the preferred winner for this order:
 * higher buy first, then better ranking on a tie.
 */
function isPreferredWinner(candidate: SolverSettlement, current: SolverSettlement, orderUid: string): boolean {
  const candidateBuy = getOrderBuyAmount(candidate, orderUid)
  const currentBuy = getOrderBuyAmount(current, orderUid)
  if (candidateBuy === undefined) return false
  if (currentBuy === undefined || candidateBuy > currentBuy) return true
  if (candidateBuy < currentBuy) return false

  return isBetterRanking(candidate.ranking, current.ranking)
}

/** Case-insensitive order UID equality; missing candidates never match. */
function isSameOrderUid(candidate: string | undefined, orderUid: string): boolean {
  if (!candidate) return false

  return candidate.toLowerCase() === orderUid.toLowerCase()
}

/** Competing solution marked as winner that includes this order. */
function isWinningSolution(solution: SolverSettlement, orderUid: string): boolean {
  return solution.isWinner === true && isCompetingSolution(solution) && solutionIncludesOrder(solution, orderUid)
}

/** Parses a decimal uint atom string to `bigint`. */
function parseUint(value: string | undefined): bigint | undefined {
  if (!isDecimalUint(value)) return undefined

  return BigInt(value)
}

/** Keeps the better ranked solution per solver address in `bySolver`. */
function rememberBetterSolution(bySolver: Map<string, RankedSolution>, ranked: RankedSolution | undefined): void {
  if (!ranked) return

  const current = bySolver.get(ranked.solverAddress)
  if (!current || compareSolverRows(ranked, current) < 0) bySolver.set(ranked.solverAddress, ranked)
}

/** Whether the solution lists this order. */
function solutionIncludesOrder(solution: SolverSettlement, orderUid: string): boolean {
  return solution.orders?.some((order) => isSameOrderUid(order.id, orderUid)) ?? false
}

/**
 * Gain as a percent of the alone baseline. Missing when the baseline is zero
 * (no meaningful denominator) or the percent is not finite.
 */
function toGainPercent(gainAmount: bigint, baselineBuyAmount: bigint): number | undefined {
  if (baselineBuyAmount <= 0n) return undefined

  const percent = Number(new Fraction(gainAmount, baselineBuyAmount).multiply(100).toSignificant(6))

  return Number.isFinite(percent) ? percent : undefined
}

/**
 * Maps a competing solution that fills this order into a ranking row candidate.
 * Skips filtered-out solutions, missing solver addresses, and invalid fills.
 */
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

/** Adapter from internal ranked solution to the shared `SolverCompetition` UI type. */
function toSolverCompetition(ranked: RankedSolution): SolverCompetition {
  return {
    executedAmounts: { buy: ranked.fill.buyAmountRaw, sell: ranked.fill.sellAmountRaw },
    solver: ranked.solverAddress,
  }
}
