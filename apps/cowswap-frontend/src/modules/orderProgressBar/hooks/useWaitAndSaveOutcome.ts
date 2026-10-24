import { useEffect, useMemo, useState } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'
import { OrderClass, SolverCompetitionResponse, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import useSWR from 'swr'

import { Order } from 'legacy/state/orders/actions'

import { useUsdAmount } from 'modules/usdAmount'

import { getOrder, getSolverCompetition, getTrades } from 'api/cowProtocol/api'

import {
  buildWaitAndSaveView,
  CompanionClassByUid,
  CompanionOrderClass,
  deriveWaitAndSaveOutcome,
  listCompanionOrderUids,
  orderUidKey,
  WaitAndSaveDerivation,
  WaitAndSaveFinishedView,
} from '../pure/WaitAndSaveOutcome/deriveWaitAndSaveOutcome.utils'
import { formatWaitAndSaveOutcome, positiveBuyGain } from '../pure/WaitAndSaveOutcome/formatWaitAndSaveOutcome.utils'

const SETTLED_COMPETITION_SWR_OPTIONS = {
  revalidateOnFocus: false,
  refreshInterval: 0,
}

const COMPETITION_POLL_MS = 2_000
const COMPETITION_WAIT_MS = 20_000

const COMPETITION_SWR_OPTIONS = {
  revalidateOnFocus: false,
  refreshInterval: (data: SolverCompetitionResponse | undefined) => (data ? 0 : COMPETITION_POLL_MS),
  shouldRetryOnError: true,
  errorRetryInterval: COMPETITION_POLL_MS,
}

interface PositiveBuyGain {
  alone: CurrencyAmount<Token>
  gain: CurrencyAmount<Token>
}

interface UseWaitAndSaveOutcomeParams {
  enabled: boolean
  chainId: SupportedChainId
  order: Order | undefined
}

export function useWaitAndSaveOutcome({
  enabled,
  chainId,
  order,
}: UseWaitAndSaveOutcomeParams): WaitAndSaveFinishedView {
  const orderId = order?.id
  const knownTxHash = readKnownSettlementTxHash(order)
  const trades = useSWR(
    settlementTradesSwrKey(enabled, chainId, orderId, knownTxHash),
    async ([, nextChainId, nextOrderId]) => fetchSettlementTxHash(nextChainId, nextOrderId),
    SETTLED_COMPETITION_SWR_OPTIONS,
  )
  const txHash = firstTxHash(knownTxHash, trades.data)
  const txPending = isSettlementTxPending(enabled, orderId, knownTxHash, trades.isLoading)
  const txMissing = isSettlementTxMissing(enabled, txPending, txHash)
  const competition = useSWR(
    solverCompetitionSwrKey(enabled, chainId, txHash),
    async ([, nextChainId, nextTxHash]) => loadSolverCompetition(nextChainId, nextTxHash),
    COMPETITION_SWR_OPTIONS,
  )
  const [competitionWaitExpired, setCompetitionWaitExpired] = useState(false)

  useEffect(() => {
    if (!enabled || !txHash || competition.data) {
      setCompetitionWaitExpired(false)
      return
    }

    const timer = window.setTimeout(() => setCompetitionWaitExpired(true), COMPETITION_WAIT_MS)
    return () => window.clearTimeout(timer)
  }, [competition.data, enabled, txHash])

  const companionUids = useMemo(() => companionUidsFor(competition.data, orderId), [competition.data, orderId])
  const companionKey = companionUids.join('|')
  const classes = useSWR(
    companionClassesSwrKey(enabled, chainId, companionKey),
    async ([, nextChainId, nextCompanionKey]) => fetchCompanionClasses(nextChainId, nextCompanionKey.split('|')),
    SETTLED_COMPETITION_SWR_OPTIONS,
  )
  const isLoading = isWaitAndSaveLoading({
    enabled,
    txPending,
    txHash,
    competitionReady: Boolean(competition.data),
    competitionWaitExpired,
    companionKey,
    classesLoading: classes.isLoading,
  })
  const derivation = useMemo(
    () =>
      selectDerivation({
        enabled,
        isLoading,
        orderId,
        txMissing,
        competition: competition.data,
        classByOrderUid: classes.data ?? {},
      }),
    [classes.data, competition.data, enabled, isLoading, orderId, txMissing],
  )
  const gain = useMemo(() => selectGain(order, derivation), [derivation, order])
  const { value: gainFiatAmount } = useUsdAmount(gain?.gain ?? null)
  const outcome = useMemo(() => selectOutcome(order, gain, gainFiatAmount), [gain, gainFiatAmount, order])

  return buildWaitAndSaveView({ enabled, isLoading, derivation, outcome })
}

function companionClassesSwrKey(
  enabled: boolean,
  chainId: SupportedChainId,
  companionKey: string,
): readonly ['waitAndSaveClasses', SupportedChainId, string] | null {
  if (!enabled || !companionKey) return null
  return ['waitAndSaveClasses', chainId, companionKey] as const
}

function companionUidsFor(competition: SolverCompetitionResponse | undefined, orderId: string | undefined): string[] {
  if (!competition || !orderId) return []
  return listCompanionOrderUids(competition, orderId)
}

async function fetchCompanionClasses(chainId: SupportedChainId, orderUids: string[]): Promise<CompanionClassByUid> {
  const entries = await Promise.all(
    orderUids.map(async (orderUid) => {
      try {
        const order = await getOrder(chainId, orderUid)
        return [orderUidKey(orderUid), toCompanionClass(order?.class)] as const
      } catch (err: unknown) {
        normalizeError(err)
        return [orderUidKey(orderUid), 'unknown'] as const
      }
    }),
  )
  return Object.fromEntries(entries)
}

async function fetchSettlementTxHash(chainId: SupportedChainId, orderId: string): Promise<string | null> {
  try {
    const trades = await getTrades({ orderUid: orderId }, { chainId })
    return latestTradeTxHash(trades)
  } catch (err: unknown) {
    throw normalizeError(err)
  }
}

function firstTxHash(knownTxHash: string | undefined, tradeTxHash: string | null | undefined): string | undefined {
  return knownTxHash || tradeTxHash || undefined
}

function isSettlementTxMissing(enabled: boolean, txPending: boolean, txHash: string | undefined): boolean {
  return enabled && !txPending && !txHash
}

function isSettlementTxPending(
  enabled: boolean,
  orderId: string | undefined,
  knownTxHash: string | undefined,
  tradesLoading: boolean,
): boolean {
  return Boolean(enabled && orderId && !knownTxHash && tradesLoading)
}

function isWaitAndSaveLoading({
  enabled,
  txPending,
  txHash,
  competitionReady,
  competitionWaitExpired,
  companionKey,
  classesLoading,
}: {
  enabled: boolean
  txPending: boolean
  txHash: string | undefined
  competitionReady: boolean
  competitionWaitExpired: boolean
  companionKey: string
  classesLoading: boolean
}): boolean {
  const competitionPending = Boolean(txHash) && !competitionReady && !competitionWaitExpired
  const classesPending = Boolean(companionKey) && classesLoading
  return Boolean(enabled && (txPending || competitionPending || classesPending))
}

function latestTradeTxHash(trades: Array<{ txHash?: string | null }>): string | null {
  for (let index = trades.length - 1; index >= 0; index -= 1) {
    const txHash = trades[index]?.txHash
    if (txHash) return txHash
  }
  return null
}

async function loadSolverCompetition(chainId: SupportedChainId, txHash: string): Promise<SolverCompetitionResponse> {
  const result = await getSolverCompetition(chainId, txHash)
  if (!result) {
    throw new Error('Solver competition unavailable')
  }
  return result
}

function readKnownSettlementTxHash(order: Order | undefined): string | undefined {
  if (!order) return undefined
  return readSettlementTxHash(order)
}

// The order payload has no settlement hash. Trades carry it; a stored order may also keep a copy.
function readSettlementTxHash(order: Order): string | undefined {
  if (order.fulfilledTransactionHash) return order.fulfilledTransactionHash

  const info = order.apiAdditionalInfo
  if (!info) return undefined
  return readTxHash(info)
}

function readTxHash(value: object): string | undefined {
  if (!('txHash' in value)) return undefined

  const { txHash } = value
  return typeof txHash === 'string' && txHash.length > 0 ? txHash : undefined
}

function selectDerivation({
  enabled,
  isLoading,
  orderId,
  txMissing,
  competition,
  classByOrderUid,
}: {
  enabled: boolean
  isLoading: boolean
  orderId: string | undefined
  txMissing: boolean
  competition: SolverCompetitionResponse | undefined
  classByOrderUid: CompanionClassByUid
}): WaitAndSaveDerivation | undefined {
  if (!enabled || isLoading) return undefined
  if (!orderId || txMissing || !competition) {
    return { membership: 'unavailable' }
  }

  return deriveWaitAndSaveOutcome({ orderUid: orderId, competition, classByOrderUid })
}

function selectGain(order: Order | undefined, derivation: WaitAndSaveDerivation | undefined): PositiveBuyGain | null {
  if (!order || !derivation?.executedBuy || !derivation.tradingAloneBuy) return null
  if (derivation.membership !== 'cow' && derivation.membership !== 'unconfirmed') return null
  return positiveBuyGain(derivation.executedBuy, derivation.tradingAloneBuy, order.outputToken)
}

function selectOutcome(
  order: Order | undefined,
  gain: PositiveBuyGain | null,
  gainFiatAmount: CurrencyAmount<Token> | null,
): ReturnType<typeof formatWaitAndSaveOutcome> {
  if (!gain || !order) return null
  return formatWaitAndSaveOutcome({
    alone: gain.alone,
    gain: gain.gain,
    token: order.outputToken,
    gainFiatAmount,
  })
}

function settlementTradesSwrKey(
  enabled: boolean,
  chainId: SupportedChainId,
  orderId: string | undefined,
  knownTxHash: string | undefined,
): readonly ['waitAndSaveTrades', SupportedChainId, string] | null {
  if (!enabled || !orderId || knownTxHash) return null
  return ['waitAndSaveTrades', chainId, orderId] as const
}

function solverCompetitionSwrKey(
  enabled: boolean,
  chainId: SupportedChainId,
  txHash: string | undefined,
): readonly ['waitAndSaveCompetition', SupportedChainId, string] | null {
  if (!enabled || !txHash) return null
  return ['waitAndSaveCompetition', chainId, txHash] as const
}

function toCompanionClass(orderClass: OrderClass | undefined): CompanionOrderClass {
  if (orderClass === OrderClass.MARKET || orderClass === OrderClass.LIMIT || orderClass === OrderClass.LIQUIDITY) {
    return orderClass
  }
  return 'unknown'
}
