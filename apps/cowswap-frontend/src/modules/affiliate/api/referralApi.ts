import { BFF_BASE_URL } from '@cowprotocol/common-const'

import { REFERRAL_API_TIMEOUT_MS, REFERRAL_SUPPORTED_NETWORKS } from '../config/constants'
import { AffiliateProgramParams } from '../config/programParams'
import {
  ReferralApiConfig,
  AffiliateCodeResponse,
  AffiliateCreateRequest,
  ReferralVerificationApiResponse,
  ReferralVerificationRequest,
  ReferralCodeResponse,
  WalletReferralStatusRequest,
  WalletReferralStatusResponse,
} from '../model/types'

export function getReferralApiConfig(): ReferralApiConfig {
  return {
    baseUrl: BFF_BASE_URL,
    timeoutMs: REFERRAL_API_TIMEOUT_MS,
  }
}

function withTimeout<T>(promise: Promise<T>, timeout: number, errorMessage: string): Promise<T> {
  if (!timeout) {
    return promise
  }

  let timeoutId: ReturnType<typeof setTimeout>

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMessage)), timeout)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId))
}

type FetchJsonResponse<T> = {
  response: Response
  data?: T
  text: string
}

async function fetchJsonResponse<T>(
  input: RequestInfo,
  init: RequestInit,
  timeout?: number,
): Promise<FetchJsonResponse<T>> {
  const response = await withTimeout(
    fetch(input, init),
    timeout ?? REFERRAL_API_TIMEOUT_MS,
    'Unable to reach referral service',
  )

  const text = await response.text().catch(() => '')
  let data: T | undefined

  if (text) {
    try {
      data = JSON.parse(text) as T
    } catch {
      data = undefined
    }
  }

  return { response, data, text }
}

function buildReferralError(status: number, text: string, data?: { message?: string }): Error {
  const message = data?.message || text || `Referral service error (${status})`
  const error = new Error(message)
  ;(error as Error & { status?: number }).status = status
  return error
}

function toAffiliateProgramParams(data?: ReferralCodeResponse): AffiliateProgramParams | undefined {
  if (!data) {
    return undefined
  }

  const { traderRewardAmount, triggerVolume, timeCapDays, volumeCap } = data

  if (
    typeof traderRewardAmount !== 'number' ||
    typeof triggerVolume !== 'number' ||
    typeof timeCapDays !== 'number' ||
    typeof volumeCap !== 'number'
  ) {
    return undefined
  }

  return {
    traderRewardAmount,
    triggerVolumeUsd: triggerVolume,
    timeCapDays,
    volumeCapUsd: volumeCap,
  }
}

export async function verifyReferralCode(
  request: ReferralVerificationRequest,
  config = getReferralApiConfig(),
): Promise<ReferralVerificationApiResponse> {
  const { code } = request
  const url = `${config.baseUrl.replace(/\/$/, '')}/ref-codes/${encodeURIComponent(code)}`

  const { response, data, text } = await fetchJsonResponse<ReferralCodeResponse>(
    url,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    config.timeoutMs,
  )

  if (response.ok) {
    return {
      code: {
        value: data?.code ?? code,
        status: 'valid',
        programActive: true,
        params: toAffiliateProgramParams(data),
      },
      wallet: {
        eligible: true,
      },
    }
  }

  if (response.status === 404) {
    return {
      code: {
        value: code,
        status: 'invalid',
        programActive: true,
      },
      wallet: {
        eligible: true,
      },
    }
  }

  if (response.status === 403) {
    return {
      code: {
        value: code,
        status: 'expired',
        programActive: false,
      },
      wallet: {
        eligible: true,
      },
    }
  }

  throw buildReferralError(response.status, text, data as { message?: string } | undefined)
}

export async function getWalletReferralStatus(
  request: WalletReferralStatusRequest,
  config = getReferralApiConfig(),
): Promise<WalletReferralStatusResponse> {
  const { account } = request
  const url = `${config.baseUrl.replace(/\/$/, '')}/affiliate/${account}`

  const { response, data, text } = await fetchJsonResponse<AffiliateCodeResponse>(
    url,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    config.timeoutMs,
  )

  if (response.ok) {
    return {
      wallet: {
        linkedCode: data?.code,
      },
    }
  }

  if (response.status === 404) {
    return { wallet: {} }
  }

  throw buildReferralError(response.status, text, data as { message?: string } | undefined)
}

export async function getAffiliateCode(
  account: string,
  config = getReferralApiConfig(),
): Promise<AffiliateCodeResponse | null> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/affiliate/${account}`
  const { response, data, text } = await fetchJsonResponse<AffiliateCodeResponse>(
    url,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    config.timeoutMs,
  )

  if (response.ok) {
    if (!data) {
      throw buildReferralError(response.status, text, { message: 'Affiliate response missing' })
    }
    return data
  }

  if (response.status === 404) {
    return null
  }

  throw buildReferralError(response.status, text, data as { message?: string } | undefined)
}

export async function createAffiliateCode(
  request: AffiliateCreateRequest,
  config = getReferralApiConfig(),
): Promise<AffiliateCodeResponse> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/affiliate/${request.walletAddress}`
  const body = JSON.stringify(request)

  const { response, data, text } = await fetchJsonResponse<AffiliateCodeResponse>(
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

  if (response.ok) {
    if (!data) {
      throw buildReferralError(response.status, text, { message: 'Affiliate response missing' })
    }
    return data
  }

  throw buildReferralError(response.status, text, data as { message?: string } | undefined)
}

export function isSupportedReferralNetwork(chainId: number | undefined | null): boolean {
  if (!chainId) {
    return false
  }

  return REFERRAL_SUPPORTED_NETWORKS.includes(chainId as number)
}
