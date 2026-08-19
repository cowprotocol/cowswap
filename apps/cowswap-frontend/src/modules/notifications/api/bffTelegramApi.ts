import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { BffApiClient, NO_RATE_LIMIT, unwrapOk } from '@cowprotocol/common-utils'

export interface TelegramConnectStatusResponse {
  connected: boolean
  username?: string
  // Static link to the bot chat - unsubscribing only happens there (see the bot's
  // "Unsubscribe" button), so the frontend never posts a disconnect request itself.
  botDeepLink: string
}

export interface TelegramConnectTokenResponse {
  token: string
  deepLink: string
}

const TELEGRAM_API_TIMEOUT_MS = 10_000

class BffTelegramApi extends BffApiClient {
  constructor(baseUrl: string) {
    // Each poll tick already retries on its own schedule (see useTelegramConnect.ts), so this
    // opts out of BffApiClient's default rate-limit/backoff instead of stacking both.
    super(baseUrl, TELEGRAM_API_TIMEOUT_MS, 'Unable to reach notifications service', NO_RATE_LIMIT)
  }

  async getConnectToken(account: string): Promise<TelegramConnectTokenResponse> {
    const result = await this.fetchJson<TelegramConnectTokenResponse>(`accounts/${account}/telegram/connect-token`, {
      method: 'POST',
      // Fastify (the real bff) 400s a POST that carries `Content-Type: application/json`
      // with no body at all (FST_ERR_CTP_EMPTY_JSON_BODY) - send an explicit empty object.
      body: '{}',
    })
    return unwrapOk(result, 'Telegram connect-token response missing')
  }

  async getConnectStatus(account: string): Promise<TelegramConnectStatusResponse> {
    const result = await this.fetchJson<TelegramConnectStatusResponse>(`accounts/${account}/telegram/connect-status`)
    return unwrapOk(result, 'Telegram connect-status response missing')
  }
}

export const bffTelegramApi = new BffTelegramApi(BFF_BASE_URL)
