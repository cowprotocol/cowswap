import { DEFAULT_APP_CODE, SAFE_APP_CODE } from '@cowprotocol/common-const'
import { formatLocaleNumber } from '@cowprotocol/common-utils'
import { Address, areAddressesEqual, EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'
import type { TypedDataField } from '@ethersproject/abstract-signer'

import { i18n } from '@lingui/core'

import { SerializedOrder } from 'legacy/state/orders/actions'
import { flatOrdersStateNetwork } from 'legacy/state/orders/flatOrdersStateNetwork'
import { getDefaultNetworkState, OrdersState } from 'legacy/state/orders/reducer'

import { decodeAppData } from 'modules/appData'

import {
  AFFILIATE_PAYOUTS_CHAIN_ID,
  AFFILIATE_REWARDS_UPDATE_INTERVAL_MS,
  AFFILIATE_REWARDS_UPDATE_LAG_MS,
  AFFILIATE_STATS_REFRESH_INTERVAL_MS,
  AFFILIATE_SUPPORTED_CHAIN_IDS,
  PROGRAM_DEFAULTS,
  REF_CODE_PATTERN,
} from '../config/affiliateProgram.const'

const EMPTY_VALUE_LABEL = '-'

const AFFILIATE_TYPED_DATA_DOMAIN = {
  name: 'CoW Swap Affiliate',
  version: '1',
} as const

const AFFILIATE_TYPED_DATA_TYPES: Record<string, TypedDataField[]> = {
  AffiliateCode: [
    { name: 'walletAddress', type: 'address' },
    { name: 'code', type: 'string' },
    { name: 'chainId', type: 'uint256' },
  ],
}

export type AppDataOrder = AppDataResponse & {
  apiAdditionalInfo?: AppDataResponse
}
export type AppDataResponse = {
  appData?: string | null
  fullAppData?: string | null
  full_app_data?: string | null
  document?: JsonRecord
}

type AffiliatePartnerTypedDataMsg = {
  domain: typeof AFFILIATE_TYPED_DATA_DOMAIN
  types: Record<string, TypedDataField[]>
  message: TypedDataMsg
}

type JsonRecord = Record<string, object | string | number | boolean | null>

type TypedDataMsg = { walletAddress: string; code: string; chainId: number }

export function buildPartnerTypedData(message: TypedDataMsg): AffiliatePartnerTypedDataMsg {
  return {
    domain: AFFILIATE_TYPED_DATA_DOMAIN,
    types: AFFILIATE_TYPED_DATA_TYPES,
    message,
  }
}

export function extractFullAppDataFromOrder(order: AppDataOrder): string | undefined {
  return extractFullAppDataFromResponse(order) || extractFullAppDataFromResponse(order.apiAdditionalInfo)
}

export function extractFullAppDataFromResponse(response: AppDataResponse | string | undefined): string | undefined {
  if (!response) return undefined

  if (typeof response === 'string') {
    return response
  }

  const fullAppData =
    readStringField(response, 'fullAppData') ||
    readStringField(response, 'full_app_data') ||
    readStringField(response, 'appData')

  if (fullAppData) {
    return fullAppData
  }

  const document = response.document
  if (isRecord(document)) {
    return JSON.stringify(document)
  }

  return undefined
}

export function formatCompactNumber(value?: number): string {
  if (typeof value !== 'number') return EMPTY_VALUE_LABEL

  return formatLocaleNumber({
    number: value,
    locale: i18n.locale,
    options: { notation: 'compact', maximumFractionDigits: 2 },
  })
}

export function formatRefCode(value?: string | null): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toUpperCase()
  return REF_CODE_PATTERN.test(normalized) ? normalized : undefined
}

export function formatUsdcCompact(value?: number): string {
  const formatted = formatCompactNumber(value)
  return formatted === EMPTY_VALUE_LABEL ? EMPTY_VALUE_LABEL : `${formatted} USDC`
}

export function formatUsdCompact(value?: number): string {
  const formatted = formatCompactNumber(value)
  return formatted === EMPTY_VALUE_LABEL ? EMPTY_VALUE_LABEL : `$${formatted}`
}

export function generateSuggestedCode(): string {
  const suffix = randomDigits(6)
  return `COW-${suffix}`
}

export function getAppDataHash(order: AppDataOrder): string | undefined {
  const appData = readStringField(order, 'appData')

  if (!appData || appData.trim().startsWith('{')) {
    return undefined
  }

  return appData
}

export function getApproxNextStatsUpdateAt(): Date {
  return new Date(
    getApproxStatsUpdatedAt().getTime() + AFFILIATE_REWARDS_UPDATE_INTERVAL_MS + AFFILIATE_STATS_REFRESH_INTERVAL_MS,
  )
}

export function getApproxStatsUpdatedAt(): Date {
  const currentTimeMs = Date.now()

  return new Date(
    Math.floor((currentTimeMs - AFFILIATE_REWARDS_UPDATE_LAG_MS) / AFFILIATE_REWARDS_UPDATE_INTERVAL_MS) *
      AFFILIATE_REWARDS_UPDATE_INTERVAL_MS +
      AFFILIATE_REWARDS_UPDATE_LAG_MS,
  )
}

export function getDefaultTraderRewardAmount(): number {
  return (PROGRAM_DEFAULTS.AFFILIATE_REWARD_AMOUNT * PROGRAM_DEFAULTS.AFFILIATE_REVENUE_SPLIT_TRADER_PCT) / 100
}

export function getDefaultTriggerVolume(): number {
  return PROGRAM_DEFAULTS.AFFILIATE_TRIGGER_VOLUME
}

export function getLocalTrades(account: Address | undefined, ordersState: OrdersState | undefined): SerializedOrder[] {
  if (!account || !ordersState) {
    return []
  }

  const result: SerializedOrder[] = []

  for (const [networkId, networkState] of Object.entries(ordersState)) {
    const fullState = { ...getDefaultNetworkState(Number(networkId)), ...(networkState || {}) }
    const ordersMap = flatOrdersStateNetwork(fullState)

    for (const orderState of Object.values(ordersMap)) {
      const order = orderState?.order
      if (!order || !areAddressesEqual(order.owner, account)) {
        continue
      }

      result.push(order)
    }
  }

  return result
}

export function getPartnerRewardAmountLabel(
  rewardAmount: number = PROGRAM_DEFAULTS.AFFILIATE_REWARD_AMOUNT,
  revenueSplitAffiliatePct: number = PROGRAM_DEFAULTS.AFFILIATE_REVENUE_SPLIT_AFFILIATE_PCT,
): string {
  return formatUsdCompact(rewardAmount * (revenueSplitAffiliatePct / 100))
}

export function getProgressToNextReward(triggerVolume?: number, leftToNextReward?: number): number {
  if (typeof triggerVolume !== 'number' || typeof leftToNextReward !== 'number') {
    return 0
  }

  return Math.max(triggerVolume - leftToNextReward, 0)
}

export function getRefCodeFromAppData(fullAppData: string | undefined): string | undefined {
  if (!fullAppData) return undefined

  const decoded = decodeAppData(fullAppData)
  const metadata = decoded?.metadata
  const referrer = isRecord(metadata) ? metadata.referrer : undefined

  if (!decoded || !isRecord(referrer)) {
    return undefined
  }

  return formatRefCode(readStringFromRecord(referrer, 'code'))
}

export function getReferralLink(refCode: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://swap.cow.fi'
  return `${origin}?ref=${refCode}`
}

export function getReferralTrafficPercent(triggerVolume?: number, progressToNextReward?: number): number {
  if (typeof triggerVolume !== 'number' || typeof progressToNextReward !== 'number') {
    return 0
  }

  return Math.min(100, Math.round((progressToNextReward / triggerVolume) * 100))
}

export function isExecutedNonIntegratorOrder(order: EnrichedOrder | SerializedOrder): boolean {
  const { status } = order

  if (status !== OrderStatus.FULFILLED && !order.partiallyFillable) return false

  const executedBuy = (order as EnrichedOrder).executedBuyAmount !== '0'
  const executedSell = (order as EnrichedOrder).executedSellAmount !== '0'

  if (!executedBuy && !executedSell) return false

  const fullAppData = extractFullAppDataFromOrder(order)
  const appCode = decodeAppData(fullAppData)?.appCode

  if (typeof appCode !== 'string') return false

  return appCode === DEFAULT_APP_CODE || appCode === SAFE_APP_CODE
}

export function isSupportedPayoutsNetwork(chainId: number): boolean {
  return chainId === AFFILIATE_PAYOUTS_CHAIN_ID
}

export function isSupportedTradingNetwork(chainId: number): boolean {
  return AFFILIATE_SUPPORTED_CHAIN_IDS.includes(chainId)
}

export function toValidDate(value: string | undefined): Date | null {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null
}

function randomDigits(length: number): string {
  return `${Math.floor(Math.random() * Math.pow(10, length))}`.padStart(length, '0')
}

function readStringField(value: AppDataResponse | undefined, key: keyof AppDataResponse): string | undefined {
  if (!value) return undefined

  const raw = value[key]

  return typeof raw === 'string' ? raw : undefined
}

function readStringFromRecord(value: JsonRecord | undefined, key: string): string | undefined {
  if (!value) return undefined

  const raw = value[key]

  return typeof raw === 'string' ? raw : undefined
}
