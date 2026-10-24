import { OrderClass, SolverCompetitionResponse } from '@cowprotocol/cow-sdk'

import type { CowParticipationVariant } from 'modules/trade'

import type { WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.pure'

export type CompanionClassByUid = Readonly<Record<string, CompanionOrderClass>>

export type CompanionOrderClass = OrderClass | 'unknown'

export type CowMembership = 'cow' | 'not_cow' | 'unconfirmed' | 'unavailable'

export interface DeriveWaitAndSaveOutcomeParams {
  orderUid: string
  competition: SolverCompetitionResponse | undefined
  classByOrderUid: CompanionClassByUid
  unavailable?: boolean
}

export interface WaitAndSaveDerivation {
  membership: CowMembership
  executedBuy?: string
  tradingAloneBuy?: string
}

export interface WaitAndSaveFinishedView {
  footerVariant: CowParticipationVariant | null
  outcome: WaitAndSaveOutcomeProps | null
}

type CompetitionSolution = NonNullable<SolverCompetitionResponse['solutions']>[number]

export function buildWaitAndSaveView({
  enabled,
  isLoading,
  derivation,
  outcome,
}: {
  enabled: boolean
  isLoading: boolean
  derivation: WaitAndSaveDerivation | undefined
  outcome: WaitAndSaveOutcomeProps | null
}): WaitAndSaveFinishedView {
  if (!enabled) {
    return { footerVariant: null, outcome: null }
  }

  if (isLoading || !derivation) {
    return { footerVariant: 'unconfirmed', outcome: null }
  }

  if (derivation.membership === 'unavailable') {
    return { footerVariant: 'unavailable', outcome: null }
  }

  if (derivation.membership === 'not_cow') {
    return { footerVariant: null, outcome: null }
  }

  return {
    footerVariant: derivation.membership === 'cow' ? 'cow' : 'unconfirmed',
    outcome,
  }
}

export function deriveWaitAndSaveOutcome({
  orderUid,
  competition,
  classByOrderUid,
  unavailable = false,
}: DeriveWaitAndSaveOutcomeParams): WaitAndSaveDerivation {
  if (unavailable || !orderUid || !competition?.solutions?.length) {
    return { membership: 'unavailable' }
  }

  const winner = competition.solutions.find(
    (solution) => solution.isWinner && solutionIncludesOrder(solution, orderUid),
  )

  if (!winner) {
    return { membership: 'unavailable' }
  }

  const membership = classifyWinner(winner, orderUid, classByOrderUid)

  if (membership !== 'cow' && membership !== 'unconfirmed') {
    return { membership }
  }

  return {
    membership,
    executedBuy: buyAmountOf(winner, orderUid),
    tradingAloneBuy: bestTradingAloneBuy(competition.solutions, orderUid, classByOrderUid),
  }
}

export function listCompanionOrderUids(competition: SolverCompetitionResponse | undefined, orderUid: string): string[] {
  if (!competition?.solutions?.length || !orderUid) return []

  const seen = new Set<string>()
  return competition.solutions
    .filter((solution) => solutionIncludesOrder(solution, orderUid))
    .flatMap((solution) => solution.orders ?? [])
    .flatMap((order) => takeCompanionId(order.id, orderUid, seen))
}

export function orderUidKey(uid: string): string {
  return uid.toLowerCase().replace(/^0x/, '')
}

function bestTradingAloneBuy(
  solutions: CompetitionSolution[],
  orderUid: string,
  classByOrderUid: CompanionClassByUid,
): string | undefined {
  let bestAmount: bigint | undefined
  let bestRaw: string | undefined

  for (const solution of solutions) {
    if (!solutionIncludesOrder(solution, orderUid) || !isTradingAloneSolution(solution, orderUid, classByOrderUid)) {
      continue
    }

    const raw = buyAmountOf(solution, orderUid)
    const amount = parseAtoms(raw)
    if (amount === undefined || raw === undefined) continue
    if (bestAmount !== undefined && amount <= bestAmount) continue

    bestAmount = amount
    bestRaw = raw
  }

  return bestRaw
}

function buyAmountOf(solution: CompetitionSolution, orderUid: string): string | undefined {
  return (solution.orders ?? []).find((order) => !!order.id && sameOrderUid(order.id, orderUid))?.buyAmount
}

function classifyWinner(
  winner: CompetitionSolution,
  orderUid: string,
  classByOrderUid: CompanionClassByUid,
): CowMembership {
  let traderCount = 0

  for (const order of winner.orders ?? []) {
    // Ignore our own order:
    if (!order.id || sameOrderUid(order.id, orderUid)) continue

    const orderClass = lookupCompanionClass(classByOrderUid, order.id)

    // Ignore LIQUIDITY orders:
    if (orderClass === OrderClass.MARKET || orderClass === OrderClass.LIMIT) {
      traderCount += 1
    }
  }

  return traderCount > 0 ? 'cow' : 'not_cow'
}

function isTradingAloneSolution(
  solution: CompetitionSolution,
  orderUid: string,
  classByOrderUid: CompanionClassByUid,
): boolean {
  for (const order of solution.orders ?? []) {
    if (!order.id || sameOrderUid(order.id, orderUid)) continue

    const orderClass = lookupCompanionClass(classByOrderUid, order.id)
    if (orderClass !== OrderClass.LIQUIDITY) return false
  }

  return true
}

function lookupCompanionClass(classByOrderUid: CompanionClassByUid, uid: string): CompanionOrderClass {
  const orderClass = classByOrderUid[uid] ?? classByOrderUid[orderUidKey(uid)]
  if (orderClass === OrderClass.MARKET || orderClass === OrderClass.LIMIT || orderClass === OrderClass.LIQUIDITY) {
    return orderClass
  }
  return 'unknown'
}

function parseAtoms(value: string | undefined): bigint | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined
  return BigInt(value)
}

function sameOrderUid(left: string, right: string): boolean {
  return orderUidKey(left) === orderUidKey(right)
}

function solutionIncludesOrder(solution: CompetitionSolution, orderUid: string): boolean {
  return (solution.orders ?? []).some((order) => !!order.id && sameOrderUid(order.id, orderUid))
}

function takeCompanionId(id: string | undefined, orderUid: string, seen: Set<string>): string[] {
  if (!id || sameOrderUid(id, orderUid)) return []

  const key = orderUidKey(id)
  if (seen.has(key)) return []

  seen.add(key)
  return [id]
}
