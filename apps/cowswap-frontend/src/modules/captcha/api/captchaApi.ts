import { JSON_HEADERS, isRecord, parseJsonResponse, readStringField } from '@cowprotocol/common-utils'

import { TURNSTILE_AUTH_URL } from '../config/captcha.const'
import { logCaptcha } from '../logger'

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
    const error = isRecord(data) ? readStringField(data, 'error') : undefined
    throw new Error(error || text || `Captcha JWT exchange failed with status ${response.status}`)
  }

  const jwt = isRecord(data) ? readStringField(data, 'jwt') : undefined

  if (!jwt) {
    throw new Error('Invalid captcha JWT exchange response')
  }

  return jwt
}
