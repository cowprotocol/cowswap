import { BFF_BASE_URL } from '@cowprotocol/common-const'

import { fetchWithRateLimit } from 'common/utils/fetch'
import { wait } from 'common/utils/wait'

import {
  PartnerInfoResponse,
  PartnerCreateRequest,
  PartnerStatsResponse,
  TraderInfoResponse,
  TraderStatsResponse,
} from './bffAffiliateApi.types'

import {
  AFFILIATE_API_TIMEOUT_MS,
  BACKOFF_MAX_ATTEMPTS,
  BACKOFF_START_DELAY_MS,
  BACKOFF_TIME_MULTIPLE,
  RATE_LIMIT_INTERVAL_MS,
  VERIFICATION_MIN_RESPONSE_DELAY_MS,
  VERIFICATION_RETRY_DELAY_MS,
} from '../config/affiliateProgram.const'
import {
  ApiError,
  fetchWithTimeout,
  JSON_HEADERS,
  parseJsonResponse,
  STATUS_CODES_TO_RETRY,
  RetryableResponseError,
  unwrapOk,
} from '../utils/api-utils'

import type { ApiErrorPayload, FetchJsonResponse } from '../utils/api-utils'

class BffAffiliateApi {
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly fetchRateLimited: ReturnType<typeof fetchWithRateLimit>

  /**
   * Configuration
   */

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

  private buildUrl(path: string): string {
    const normalizedPath = path.replace(/^\//, '')
    return `${this.baseUrl}/${normalizedPath}`
  }

  private async fetchJsonResponse<T>(input: string, init?: RequestInit): Promise<FetchJsonResponse<T>> {
    const response = await this.fetchRateLimited(async () => {
      const requestInit = {
        method: 'GET',
        headers: JSON_HEADERS,
        ...init,
      }
      const response = await fetchWithTimeout(input, requestInit, this.timeoutMs)
      if (STATUS_CODES_TO_RETRY.has(response.status)) {
        throw new RetryableResponseError(response.status)
      }
      return response
    })
    return parseJsonResponse<T>(response)
  }

  /**
   * API
   */

  async verifyCode(code: string): Promise<TraderInfoResponse> {
    const url = this.buildUrl(`ref-codes/${encodeURIComponent(code)}`)
    try {
      const [result] = await Promise.all([
        this.fetchJsonResponse<TraderInfoResponse>(url),
        wait(VERIFICATION_MIN_RESPONSE_DELAY_MS),
      ])
      return unwrapOk(result, 'Trader response missing')
    } catch (error) {
      await wait(VERIFICATION_RETRY_DELAY_MS)
      throw error
    }
  }

  async verifyCodeAvailability(code: string): Promise<boolean> {
    const url = this.buildUrl(`ref-codes/${encodeURIComponent(code)}`)
    const { response, text } = await this.fetchJsonResponse<TraderInfoResponse>(url)

    if (response.status === 404) return true
    if (response.ok || response.status === 403) return false

    throw new ApiError(response.status, text)
  }

  async createCode(request: PartnerCreateRequest): Promise<PartnerInfoResponse> {
    const url = this.buildUrl(`affiliate/${request.walletAddress}`)
    const result = await this.fetchJsonResponse<PartnerInfoResponse>(url, {
      method: 'POST',
      body: JSON.stringify(request),
    })
    return unwrapOk(result, 'Affiliate response missing')
  }

  async getTraderInfo(code: string): Promise<TraderInfoResponse | null> {
    const url = this.buildUrl(`ref-codes/${encodeURIComponent(code)}`)
    const { response, data, text } = await this.fetchJsonResponse<TraderInfoResponse>(url)
    if (response.status === 404) return null
    if (response.ok) return data ?? null
    throw new ApiError(response.status, text, data as ApiErrorPayload)
  }

  async getPartnerInfo(account: string): Promise<PartnerInfoResponse | null> {
    const url = this.buildUrl(`affiliate/${account}`)
    const { response, data, text } = await this.fetchJsonResponse<PartnerInfoResponse>(url)
    if (response.status === 404) return null
    if (response.ok) return data ?? null
    throw new ApiError(response.status, text, data as ApiErrorPayload)
  }

  async getTraderStats(account: string): Promise<TraderStatsResponse | null> {
    const url = this.buildUrl(`affiliate/trader-stats/${account}`)
    const { response, data, text } = await this.fetchJsonResponse<TraderStatsResponse>(url)
    if (response.status === 404) return null
    if (response.ok) return data ?? null
    throw new ApiError(response.status, text, data as ApiErrorPayload)
  }

  async getAffiliateStats(account: string): Promise<PartnerStatsResponse | null> {
    const url = this.buildUrl(`affiliate/affiliate-stats/${account}`)
    const { response, data, text } = await this.fetchJsonResponse<PartnerStatsResponse>(url)
    if (response.status === 404) return null
    if (response.ok) return data ?? null
    throw new ApiError(response.status, text, data as ApiErrorPayload)
  }
}

export const bffAffiliateApi = new BffAffiliateApi(BFF_BASE_URL, AFFILIATE_API_TIMEOUT_MS)
