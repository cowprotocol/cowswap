import { formatLocaleNumber } from '@cowprotocol/common-utils'
import type { TypedDataField } from '@ethersproject/abstract-signer'

import { i18n } from '@lingui/core'

import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'

const REFERRER_CODE_PATTERN = /^[A-Z0-9_-]{5,20}$/

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

export type PartnerProgramParams = {
  traderRewardAmount: number
  triggerVolumeUsd: number
  timeCapDays: number
  volumeCapUsd: number
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-'
  }

  return formatLocaleNumber({
    number: value,
    locale: i18n.locale,
    options: { notation: 'compact', maximumFractionDigits: 2 },
  })
}

export function formatUsdCompact(value: number | null | undefined): string {
  const formatted = formatCompactNumber(value)
  return formatted === '-' ? '-' : `$${formatted}`
}

export function formatUsdcCompact(value: number | null | undefined): string {
  const formatted = formatCompactNumber(value)
  return formatted === '-' ? '-' : `${formatted} USDC`
}

export function generateSuggestedCode(): string {
  const suffix = randomDigits(6)
  return `COW-${suffix}`
}

function randomDigits(length: number): string {
  return `${Math.floor(Math.random() * Math.pow(10, length))}`.padStart(length, '0')
}

export function isSupportedReferralNetwork(chainId: number | undefined | null): boolean {
  if (!chainId) {
    return false
  }

  return AFFILIATE_SUPPORTED_CHAIN_IDS.includes(chainId as number)
}
