import { formatLocaleNumber } from '@cowprotocol/common-utils'
import type { TypedDataField } from '@ethersproject/abstract-signer'

import { i18n } from '@lingui/core'

import { PartnerInfoResponse } from './affiliateProgramTypes'

import { AFFILIATE_PAYOUT_HISTORY_CHAIN_ID, AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'

const REFERRER_CODE_PATTERN = /^[A-Z0-9_-]{5,20}$/
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
  return REFERRER_CODE_PATTERN.test(normalized) ? normalized : undefined
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

export function getRewardAmountLabel(programParams: PartnerInfoResponse | null): string {
  if (typeof programParams?.rewardAmount !== 'number' || typeof programParams.revenueSplitAffiliatePct !== 'number') {
    return 'reward'
  }

  return formatUsdCompact(programParams.rewardAmount * (programParams.revenueSplitAffiliatePct / 100))
}

export function getProgressToNextReward(triggerVolume: number | null, leftToNextReward: number | undefined): number {
  if (triggerVolume === null || leftToNextReward === undefined) {
    return 0
  }

  return Math.max(triggerVolume - leftToNextReward, 0)
}

export function getReferralTrafficPercent(triggerVolume: number | null, progressToNextReward: number): number {
  if (triggerVolume === null) {
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
  return chainId === AFFILIATE_PAYOUT_HISTORY_CHAIN_ID
}
