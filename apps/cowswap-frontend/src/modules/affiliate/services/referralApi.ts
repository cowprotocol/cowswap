import { withTimeout } from '@cowprotocol/common-utils'

import { DEFAULT_REFERRAL_API_URL, REFERRAL_API_TIMEOUT_MS, REFERRAL_SUPPORTED_NETWORKS } from '../constants'
import {
  ReferralApiConfig,
  ReferralVerificationApiResponse,
  ReferralVerificationRequest,
  WalletReferralStatusRequest,
  WalletReferralStatusResponse,
} from '../types'

export const REFERRAL_API_CONFIG: ReferralApiConfig = {
  baseUrl: DEFAULT_REFERRAL_API_URL,
  timeoutMs: REFERRAL_API_TIMEOUT_MS,
}

async function fetchJson<T>(input: RequestInfo, init: RequestInit, timeout?: number): Promise<T> {
  const response = await withTimeout(
    fetch(input, init),
    timeout ?? REFERRAL_API_TIMEOUT_MS,
    'Unable to reach referral service',
  )

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    const error = new Error(text || `Referral service error (${response.status})`)
    ;(error as Error & { status?: number }).status = response.status
    throw error
  }

  return (await response.json()) as T
}

export async function verifyReferralCode(
  request: ReferralVerificationRequest,
  config = REFERRAL_API_CONFIG,
): Promise<ReferralVerificationApiResponse> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/api/v1/referrals/verify`
  const body = JSON.stringify(request)

  return fetchJson<ReferralVerificationApiResponse>(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    },
    config.timeoutMs,
  )
}

export async function getWalletReferralStatus(
  request: WalletReferralStatusRequest,
  config = REFERRAL_API_CONFIG,
): Promise<WalletReferralStatusResponse> {
  const { account } = request
  const url = `${config.baseUrl.replace(/\/$/, '')}/api/v1/referrals/wallets/${account}`

  return fetchJson<WalletReferralStatusResponse>(
    url,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    config.timeoutMs,
  )
}

export function isSupportedReferralNetwork(chainId: number | undefined | null): boolean {
  if (!chainId) {
    return false
  }

  return REFERRAL_SUPPORTED_NETWORKS.includes(chainId as number)
}
