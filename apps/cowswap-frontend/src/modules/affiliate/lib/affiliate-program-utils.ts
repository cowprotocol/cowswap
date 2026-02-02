import { formatLocaleNumber } from '@cowprotocol/common-utils'
import type { TypedDataField } from '@ethersproject/abstract-signer'

import { i18n } from '@lingui/core'

import { AFFILIATE_REWARDS_CURRENCY } from '../config/constants'
import { TraderReferralCodeVerificationStatus } from '../model/partner-trader-types'

export const AFFILIATE_TYPED_DATA_DOMAIN = {
  name: 'CoW Swap Affiliate',
  version: '1',
} as const

export const AFFILIATE_TYPED_DATA_TYPES: Record<string, TypedDataField[]> = {
  AffiliateCode: [
    { name: 'walletAddress', type: 'address' },
    { name: 'code', type: 'string' },
    { name: 'chainId', type: 'uint256' },
  ],
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function buildPartnerTypedData(params: { walletAddress: string; code: string; chainId: number }) {
  return {
    domain: {
      ...AFFILIATE_TYPED_DATA_DOMAIN,
    },
    types: AFFILIATE_TYPED_DATA_TYPES,
    message: {
      walletAddress: params.walletAddress,
      code: params.code,
      chainId: params.chainId,
    },
  }
}

const CODE_ALLOWED_REGEX = /[A-Z0-9_-]/

export function sanitizeReferralCode(raw: string): string {
  if (!raw) {
    return ''
  }

  const next = raw
    .trim()
    .toUpperCase()
    .split('')
    .filter((char) => CODE_ALLOWED_REGEX.test(char))
    .join('')

  return next.slice(0, 20)
}

export function isReferralCodeLengthValid(code: string): boolean {
  return code.length >= 5 && code.length <= 20
}

export type PartnerProgramParams = {
  traderRewardAmount: number
  triggerVolumeUsd: number
  timeCapDays: number
  volumeCapUsd: number
}

export function getPartnerProgramCopyValues(params: PartnerProgramParams): {
  rewardAmount: string
  rewardCurrency: string
  triggerVolume: string
  timeCapDays: number
} {
  return {
    rewardAmount: formatInteger(params.traderRewardAmount),
    rewardCurrency: AFFILIATE_REWARDS_CURRENCY,
    triggerVolume: formatInteger(params.triggerVolumeUsd),
    timeCapDays: params.timeCapDays,
  }
}

function formatInteger(value: number): string {
  return value.toLocaleString(i18n.locale, { maximumFractionDigits: 0 })
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-'
  }

  return formatLocaleNumber({
    number: value,
    locale: i18n.locale,
    options: { notation: 'compact', maximumFractionDigits: 1 },
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

export function getIncomingIneligibleCode(
  incomingCode: string | undefined,
  verification: TraderReferralCodeVerificationStatus,
): string | undefined {
  if (incomingCode) {
    return incomingCode
  }

  if (verification.kind === 'ineligible') {
    return verification.code
  }

  return undefined
}
