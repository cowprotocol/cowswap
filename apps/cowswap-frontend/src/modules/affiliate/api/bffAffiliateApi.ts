import { AFFILIATE_API_TIMEOUT_MS } from '../config/constants'
import {
  AffiliateCodeResponse,
  AffiliateCreateRequest,
  AffiliateStatsResponse,
  ReferralCodeResponse,
  ReferralVerificationResponse,
  ReferralVerificationRequest,
  TraderStatsResponse,
  WalletReferralStatusRequest,
  WalletReferralStatusResponse,
} from '../model/types'

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
function buildReferralError(status: number, text: string, data?: { message?: string }): Error {
  const message = data?.message || text || `Referral service error (${status})`
  const error = new Error(message)
  ;(error as Error & { status?: number }).status = status
  return error
}
export class BffAffiliateApi {
  private readonly baseUrl: string
  private readonly timeoutMs: number

  constructor(baseUrl: string, timeoutMs: number = AFFILIATE_API_TIMEOUT_MS) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.timeoutMs = timeoutMs
  }
  async verifyReferralCode(request: ReferralVerificationRequest): Promise<ReferralVerificationResponse> {
    const { code } = request
    const url = this.buildUrl(`ref-codes/${encodeURIComponent(code)}`)
    const { response, data, text } = await this.fetchJsonResponse<ReferralCodeResponse>(url, {
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
  async getWalletReferralStatus(request: WalletReferralStatusRequest): Promise<WalletReferralStatusResponse> {
    const { account } = request
    const url = this.buildUrl(`affiliate/${account}`)

    const { response, data, text } = await this.fetchJsonResponse<AffiliateCodeResponse>(url, {
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
  async getAffiliateCode(account: string): Promise<AffiliateCodeResponse | null> {
    const url = this.buildUrl(`affiliate/${account}`)
    const { response, data, text } = await this.fetchJsonResponse<AffiliateCodeResponse>(url, {
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
  async getAffiliateStats(account: string): Promise<AffiliateStatsResponse | null> {
    const url = this.buildUrl(`affiliate/affiliate-stats/${account}`)
    const { response, data, text } = await this.fetchJsonResponse<AffiliateStatsResponse>(url, {
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
  async createAffiliateCode(request: AffiliateCreateRequest): Promise<AffiliateCodeResponse> {
    const url = this.buildUrl(`affiliate/${request.walletAddress}`)
    const body = JSON.stringify(request)

    const { response, data, text } = await this.fetchJsonResponse<AffiliateCodeResponse>(url, {
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
    const response = await this.fetchWithTimeout(input, init)

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
