import { formatLocaleNumber } from '@cowprotocol/common-utils'
import { Address, areAddressesEqual } from '@cowprotocol/cow-sdk'
import type { TypedDataField } from '@ethersproject/abstract-signer'

import { i18n } from '@lingui/core'

import { flatOrdersStateNetwork } from 'legacy/state/orders/flatOrdersStateNetwork'
import { getDefaultNetworkState, OrdersState } from 'legacy/state/orders/reducer'

import { decodeAppData } from 'modules/appData'

import { PartnerInfoResponse } from './affiliateProgramTypes'

import {
  AFFILIATE_PAYOUTS_CHAIN_ID,
  AFFILIATE_SUPPORTED_CHAIN_IDS,
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

type TypedDataMsg = { walletAddress: string; code: string; chainId: number }
type JsonRecord = Record<string, object | string | number | boolean | null>

export type AppDataResponse = {
  appData?: string | null
  fullAppData?: string | null
  full_app_data?: string | null
  document?: JsonRecord
}

export type AppDataOrder = AppDataResponse & {
  apiAdditionalInfo?: AppDataResponse
}

type AffiliatePartnerTypedDataMsg = {
  domain: typeof AFFILIATE_TYPED_DATA_DOMAIN
  types: Record<string, TypedDataField[]>
  message: TypedDataMsg
}

export function buildPartnerTypedData(message: TypedDataMsg): AffiliatePartnerTypedDataMsg {
  return {
    domain: AFFILIATE_TYPED_DATA_DOMAIN,
    types: AFFILIATE_TYPED_DATA_TYPES,
    message,
  }
}

export function formatRefCode(value?: string | null): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toUpperCase()
  return REF_CODE_PATTERN.test(normalized) ? normalized : undefined
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null
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

export function getAppDataHash(order: AppDataOrder): string | undefined {
  const appData = readStringField(order, 'appData')

  if (!appData || appData.trim().startsWith('{')) {
    return undefined
  }

  return appData
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

export function extractFullAppDataFromOrder(order: AppDataOrder): string | undefined {
  return extractFullAppDataFromResponse(order) || extractFullAppDataFromResponse(order.apiAdditionalInfo)
}

type LocalTradeOrder = AppDataOrder & {
  owner?: Address
}

export function getLocalTrades(account: Address | undefined, ordersState: OrdersState | undefined): LocalTradeOrder[] {
  if (!account || !ordersState) {
    return []
  }

  const result: LocalTradeOrder[] = []

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

export function toValidDate(value: string | undefined): Date | null {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatCompactNumber(value?: number): string {
  if (typeof value !== 'number') return EMPTY_VALUE_LABEL

  return formatLocaleNumber({
    number: value,
    locale: i18n.locale,
    options: { notation: 'compact', maximumFractionDigits: 2 },
  })
}

export function formatUsdCompact(value?: number): string {
  const formatted = formatCompactNumber(value)
  return formatted === EMPTY_VALUE_LABEL ? EMPTY_VALUE_LABEL : `$${formatted}`
}

export function formatUsdcCompact(value?: number): string {
  const formatted = formatCompactNumber(value)
  return formatted === EMPTY_VALUE_LABEL ? EMPTY_VALUE_LABEL : `${formatted} USDC`
}

export function getPartnerRewardAmountLabel(programParams?: PartnerInfoResponse | null): string {
  if (!programParams) return 'reward'

  const { rewardAmount, revenueSplitAffiliatePct } = programParams
  return formatUsdCompact(rewardAmount * (revenueSplitAffiliatePct / 100))
}

export function getProgressToNextReward(triggerVolume?: number, leftToNextReward?: number): number {
  if (typeof triggerVolume !== 'number' || typeof leftToNextReward !== 'number') {
    return 0
  }

  return Math.max(triggerVolume - leftToNextReward, 0)
}

export function getReferralTrafficPercent(triggerVolume?: number, progressToNextReward?: number): number {
  if (typeof triggerVolume !== 'number' || typeof progressToNextReward !== 'number') {
    return 0
  }

  return Math.min(100, Math.round((progressToNextReward / triggerVolume) * 100))
}

export function getApproxStatsUpdatedAt(updateIntervalHours: number, updateLagHours: number): Date {
  const intervalMs = updateIntervalHours * 60 * 60 * 1000
  const lagMs = updateLagHours * 60 * 60 * 1000
  const currentTimeMs = Date.now()

  return new Date(Math.floor((currentTimeMs - lagMs) / intervalMs) * intervalMs + lagMs)
}

export function generateSuggestedCode(): string {
  const suffix = randomDigits(6)
  return `COW-${suffix}`
}

export function getReferralLink(refCode: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://swap.cow.fi'
  return `${origin}?ref=${refCode}`
}

function randomDigits(length: number): string {
  return `${Math.floor(Math.random() * Math.pow(10, length))}`.padStart(length, '0')
}

export function isSupportedTradingNetwork(chainId?: number): boolean {
  if (!chainId) return true
  return AFFILIATE_SUPPORTED_CHAIN_IDS.includes(chainId as number)
}

export function isSupportedPayoutsNetwork(chainId?: number): boolean {
  if (!chainId) return true
  return chainId === AFFILIATE_PAYOUTS_CHAIN_ID
}
