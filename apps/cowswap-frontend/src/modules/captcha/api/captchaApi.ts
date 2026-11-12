import { JSON_HEADERS, isRecord, parseJsonResponse, readStringField } from '@cowprotocol/common-utils'

import { TURNSTILE_AUTH_URL } from '../config/captcha.const'
import { logCaptcha } from '../logger'

const TURNSTILE_TIMEOUT_OR_DUPLICATE_CODE = 'timeout-or-duplicate'

export class CaptchaExchangeError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'CaptchaExchangeError'
    this.code = code
  }
}

export async function exchangeTurnstileToken(turnstileToken: string): Promise<string> {
  logCaptcha.debug('Captcha JWT exchange request', { url: TURNSTILE_AUTH_URL })

  const response = await fetch(TURNSTILE_AUTH_URL, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ token: turnstileToken }),
  })

  const { data, text } = await parseJsonResponse<unknown>(response)

  logCaptcha.debug('Captcha JWT exchange response', { ok: response.ok, status: response.status })

  if (!response.ok) {
    const record = isRecord(data) ? data : undefined
    const message = readStringField(record, 'error')
    const code = readStringField(record, 'code')

    throw new CaptchaExchangeError(
      message || text || `Captcha JWT exchange failed with status ${response.status}`,
      code,
    )
  }

  const jwt = isRecord(data) ? readStringField(data, 'jwt') : undefined

  if (!jwt) {
    throw new Error('Invalid captcha JWT exchange response')
  }

  return jwt
}

export function isTurnstileTimeoutOrDuplicate(error: unknown): boolean {
  return error instanceof CaptchaExchangeError && error.code === TURNSTILE_TIMEOUT_OR_DUPLICATE_CODE
}
