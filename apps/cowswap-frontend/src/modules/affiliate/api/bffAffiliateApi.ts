import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { ApiError, BffApiClient, unwrapOk } from '@cowprotocol/common-utils'
import type { ApiErrorPayload } from '@cowprotocol/common-utils'

import { wait } from 'common/utils/wait'

import {
  PartnerInfoResponse,
  PartnerCreateRequest,
  PartnerStatsResponse,
  TraderActivityResponse,
  TraderInfoResponse,
  TraderStatsResponse,
} from './bffAffiliateApi.types'

import {
  AFFILIATE_API_TIMEOUT_MS,
  VERIFICATION_MIN_RESPONSE_DELAY_MS,
  VERIFICATION_RETRY_DELAY_MS,
} from '../config/affiliateProgram.const'

class BffAffiliateApi extends BffApiClient {
  constructor(baseUrl: string, timeoutMs: number = AFFILIATE_API_TIMEOUT_MS) {
    // Rate-limit/retry-on-retryable-status uses BffApiClient's default tuning.
    super(baseUrl, timeoutMs, 'Unable to reach referral service')
  }

  /**
   * API
   */

  async verifyCode(code: string): Promise<TraderInfoResponse> {
    const path = `ref-codes/${encodeURIComponent(code)}`
    try {
      const [result] = await Promise.all([
        this.fetchJson<TraderInfoResponse>(path),
        wait(VERIFICATION_MIN_RESPONSE_DELAY_MS),
      ])
      return unwrapOk(result, 'Trader response missing')
    } catch (error) {
      await wait(VERIFICATION_RETRY_DELAY_MS)
      throw error
    }
  }

  async verifyCodeAvailability(code: string): Promise<boolean> {
    const { response, text } = await this.fetchJson<TraderInfoResponse>(`ref-codes/${encodeURIComponent(code)}`)

    if (response.status === 404) return true
    if (response.ok || response.status === 403) return false

    throw new ApiError(response.status, text)
  }

  async createCode(request: PartnerCreateRequest): Promise<PartnerInfoResponse> {
    const result = await this.fetchJson<PartnerInfoResponse>(`affiliate/${request.walletAddress}`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
    return unwrapOk(result, 'Affiliate response missing')
  }

  async getTraderInfo(code: string): Promise<TraderInfoResponse | null> {
    const { response, data, text } = await this.fetchJson<TraderInfoResponse>(`ref-codes/${encodeURIComponent(code)}`)
    if (response.status === 404) return null
    if (response.ok) return data ?? null
    throw new ApiError(response.status, text, data as ApiErrorPayload)
  }

  async getPartnerInfo(account: string): Promise<PartnerInfoResponse | null> {
    const { response, data, text } = await this.fetchJson<PartnerInfoResponse>(`affiliate/${account}`)
    if (response.status === 404) return null
    if (response.ok) return data ?? null
    throw new ApiError(response.status, text, data as ApiErrorPayload)
  }

  async getTraderStats(account: string): Promise<TraderStatsResponse | null> {
    const { response, data, text } = await this.fetchJson<TraderStatsResponse>(`affiliate/trader-stats/${account}`)
    if (response.status === 404) return null
    if (response.ok) return data ?? null
    throw new ApiError(response.status, text, data as ApiErrorPayload)
  }

  async getAffiliateStats(account: string): Promise<PartnerStatsResponse | null> {
    const { response, data, text } = await this.fetchJson<PartnerStatsResponse>(`affiliate/affiliate-stats/${account}`)
    if (response.status === 404) return null
    if (response.ok) return data ?? null
    throw new ApiError(response.status, text, data as ApiErrorPayload)
  }

  async getTraderActivity(account: string): Promise<TraderActivityResponse | null> {
    const { response, data, text } = await this.fetchJson<TraderActivityResponse>(
      `affiliate/trader-activity/${account}`,
    )
    if (response.status === 404) return null
    if (response.ok) return data ?? null
    throw new ApiError(response.status, text, data as ApiErrorPayload)
  }
}

export const bffAffiliateApi = new BffAffiliateApi(BFF_BASE_URL, AFFILIATE_API_TIMEOUT_MS)
