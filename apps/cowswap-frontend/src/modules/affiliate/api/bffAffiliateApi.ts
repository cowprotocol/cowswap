import { BFF_BASE_URL } from '@cowprotocol/common-const'

import { fetchWithRateLimit } from 'common/utils/fetch'

import {
  AFFILIATE_API_TIMEOUT_MS,
  BACKOFF_MAX_ATTEMPTS,
  BACKOFF_START_DELAY_MS,
  BACKOFF_TIME_MULTIPLE,
  RATE_LIMIT_INTERVAL_MS,
  STATUS_CODES_TO_RETRY,
} from '../config/affiliateProgram.const'
import {
  PartnerCodeResponse,
  PartnerCreateRequest,
  PartnerStatsResponse,
  TraderReferralCodeResponse,
  TraderReferralCodeVerificationResponse,
  TraderReferralCodeVerificationRequest,
  TraderStatsResponse,
  TraderWalletReferralCodeStatusRequest,
  TraderWalletReferralCodeStatusResponse,
} from '../lib/affiliateProgramTypes'

const TIMEOUT_ERROR_MESSAGE = 'Unable to reach referral service'
const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

type FetchJsonResponse<T> = {
  response: Response
  data?: T
  text: string
}

class RetryableResponseError extends Error {
  readonly rawApiError: { status: number }

  constructor(status: number) {
    super(`Retryable response (${status})`)
    this.rawApiError = { status }
  }
}

function buildReferralError(status: number, text: string, data?: { message?: string }): Error {
  const message = data?.message || text || `Referral service error (${status})`
  const error = new Error(message)
  ;(error as Error & { status?: number }).status = status
  return error
}

class BffAffiliateApi {
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly fetchRateLimited: ReturnType<typeof fetchWithRateLimit>

  constructor(baseUrl: string, timeoutMs: number = AFFILIATE_API_TIMEOUT_MS) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.timeoutMs = timeoutMs
    this.fetchRateLimited = fetchWithRateLimit({
      rateLimit: {
        tokensPerInterval: 1,
        interval: RATE_LIMIT_INTERVAL_MS,
      },
      backoff: {
        numOfAttempts: BACKOFF_MAX_ATTEMPTS,
        startingDelay: BACKOFF_START_DELAY_MS,
        timeMultiple: BACKOFF_TIME_MULTIPLE,
      },
    })
  }
  async verifyReferralCode(
    request: TraderReferralCodeVerificationRequest,
  ): Promise<TraderReferralCodeVerificationResponse> {
    const { code } = request
    const url = this.buildUrl(`ref-codes/${encodeURIComponent(code)}`)
    const { response, data, text } = await this.fetchJsonResponse<TraderReferralCodeResponse>(url, {
      method: 'GET',
      headers: JSON_HEADERS,
    })

    return {
      status: response.status,
      ok: response.ok,
      data,
      text,
    }
  }
  async getWalletReferralStatus(
    request: TraderWalletReferralCodeStatusRequest,
  ): Promise<TraderWalletReferralCodeStatusResponse> {
    const { account } = request
    const url = this.buildUrl(`affiliate/${account}`)

    const { response, data, text } = await this.fetchJsonResponse<PartnerCodeResponse>(url, {
      method: 'GET',
      headers: JSON_HEADERS,
    })

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
  async getAffiliateCode(account: string): Promise<PartnerCodeResponse | null> {
    const url = this.buildUrl(`affiliate/${account}`)
    const { response, data, text } = await this.fetchJsonResponse<PartnerCodeResponse>(url, {
      method: 'GET',
      headers: JSON_HEADERS,
    })

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
  async getTraderStats(account: string): Promise<TraderStatsResponse | null> {
    const url = this.buildUrl(`affiliate/trader-stats/${account}`)
    const { response, data, text } = await this.fetchJsonResponse<TraderStatsResponse>(url, {
      method: 'GET',
      headers: JSON_HEADERS,
    })

    if (response.ok) {
      if (!data) {
        throw buildReferralError(response.status, text, { message: 'Trader stats response missing' })
      }
      return data
    }

    if (response.status === 404) {
      return null
    }

    throw buildReferralError(response.status, text, data as { message?: string } | undefined)
  }
  async getAffiliateStats(account: string): Promise<PartnerStatsResponse | null> {
    const url = this.buildUrl(`affiliate/affiliate-stats/${account}`)
    const { response, data, text } = await this.fetchJsonResponse<PartnerStatsResponse>(url, {
      method: 'GET',
      headers: JSON_HEADERS,
    })

    if (response.ok) {
      if (!data) {
        throw buildReferralError(response.status, text, { message: 'Affiliate stats response missing' })
      }
      return data
    }

    if (response.status === 404) {
      return null
    }

    throw buildReferralError(response.status, text, data as { message?: string } | undefined)
  }
  async createAffiliateCode(request: PartnerCreateRequest): Promise<PartnerCodeResponse> {
    const url = this.buildUrl(`affiliate/${request.walletAddress}`)
    const body = JSON.stringify(request)

    const { response, data, text } = await this.fetchJsonResponse<PartnerCodeResponse>(url, {
      method: 'POST',
      headers: JSON_HEADERS,
      body,
    })

    if (response.ok) {
      if (!data) {
        throw buildReferralError(response.status, text, { message: 'Affiliate response missing' })
      }
      return data
    }

    throw buildReferralError(response.status, text, data as { message?: string } | undefined)
  }
  private buildUrl(path: string): string {
    const normalizedPath = path.replace(/^\//, '')
    return `${this.baseUrl}/${normalizedPath}`
  }
  private async fetchJsonResponse<T>(input: string, init: RequestInit): Promise<FetchJsonResponse<T>> {
    const response = await this.fetchWithBackoffAndRateLimit(input, init)

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
  private async fetchWithBackoffAndRateLimit(input: RequestInfo, init: RequestInit): Promise<Response> {
    return this.fetchRateLimited(async () => {
      const response = await this.fetchWithTimeout(input, init)
      if (STATUS_CODES_TO_RETRY.includes(response.status)) {
        throw new RetryableResponseError(response.status)
      }
      return response
    })
  }
  private async fetchWithTimeout(input: RequestInfo, init: RequestInit): Promise<Response> {
    if (!this.timeoutMs) {
      return fetch(input, init)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      return await fetch(input, { ...init, signal: controller.signal })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(TIMEOUT_ERROR_MESSAGE)
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

export const bffAffiliateApi = new BffAffiliateApi(BFF_BASE_URL, AFFILIATE_API_TIMEOUT_MS)
