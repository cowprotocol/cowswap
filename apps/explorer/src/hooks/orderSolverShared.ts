import { shortenAddress } from '@cowprotocol/common-utils'
import { areAddressesEqual, isSupportedAddress } from '@cowprotocol/cow-sdk'

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

  const winnerAddress = getWinnerSolverAddress(competitionStatus?.value)

  if (winnerAddress) {
    return buildSolverInfoFromAddress(winnerAddress, solvers)
  }

  if (!txHash) return undefined

  const competitionWinner = findCompetitionWinnerAddress(
    await getSolverCompetitionByTxHash({ networkId, txHash }),
    orderUid,
  )

  return competitionWinner ? buildSolverInfoFromAddress(competitionWinner, solvers) : undefined
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

  const winnerAddress = findCompetitionWinnerAddress(competition, orderId)

  return winnerAddress ? buildSolverInfoFromAddress(winnerAddress, solvers) : undefined
}

function buildSolverInfoFromAddress(address: string, solvers: SolverInfo[]): OrderSolverInfo {
  const matchingSolver = matchSolverByAddress(address, solvers)

  if (matchingSolver) return toOrderSolverInfo(matchingSolver)

  return {
    solverId: address,
    // When the address isn't found in CMS, fall back to a shortened address for display so the
    // full 42-char address doesn't break the UI layout. `shortenAddress` throws on anything that
    // isn't a known address format, hence the guard.
    displayName: isSupportedAddress(address) ? shortenAddress(address) : address,
  }
}

/**
 * The solver competition reports the winner by its on-chain address as well, so both sources feed
 * the same CMS join and share the shortened-address fallback.
 */
function findCompetitionWinnerAddress(
  competition: SolverCompetitionResponse | undefined,
  orderId: string | undefined,
): string | undefined {
  if (!competition?.solutions?.length || !orderId) return undefined

  return competition.solutions.find((s) => s.isWinner && s.orders?.find((o) => o?.id === orderId))?.solverAddress
}

/**
 * The `/status` endpoint reports each solution's solver by its on-chain address.
 */
function getWinnerSolverAddress(value?: OrderCompetitionStatus['value']): string | undefined {
  if (!value?.length) return undefined

  const executedSolvers = value.filter((solver) => hasNonZeroExecutedAmounts(solver.executedAmounts))

  return executedSolvers[executedSolvers.length - 1]?.solver
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

/**
 * Joins the CMS solver deployments on the on-chain address.
 *
 * `areAddressesEqual` normalizes both sides, so CMS entries are matched regardless of the casing
 * they were stored with (checksummed or lowercase) and regardless of the casing the backend returns.
 */
function matchSolverByAddress(address: string, solvers: SolverInfo[]): SolverInfo | undefined {
  return solvers.find((candidate) =>
    candidate.deployments.some((deployment) => areAddressesEqual(deployment.address, address)),
  )
}

function toOrderSolverInfo({ solverId, displayName, image }: SolverInfo): OrderSolverInfo {
  return { solverId, displayName, image }
}
