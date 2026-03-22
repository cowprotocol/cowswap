import { jotaiStore } from '@cowprotocol/core'

import { TURNSTILE_API_HOSTS, TURNSTILE_TOKEN_HEADER_NAME } from './const'
import { logCaptcha } from './logger'
import { turnstileTokenAtom } from './state/turnstileTokenAtom'

let isInitialized = false

export function setupRequestInterceptor(): void {
  if (typeof window === 'undefined') return
  if (isInitialized) return

  const nativeFetch = window.fetch.bind(window)

  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init)
    const url = new URL(request.url, window.location.origin)

    if (!(TURNSTILE_API_HOSTS.has(url.hostname) && url.pathname.endsWith('/api/v1/quote'))) {
      return nativeFetch(request)
    }

    const captchaToken = jotaiStore.get(turnstileTokenAtom)

    if (!captchaToken) {
      logCaptcha('Missing token for protected request', url.pathname)
      return nativeFetch(request)
    }

    logCaptcha('Attaching token to protected request', url.pathname)
    const headers = new Headers(request.headers)
    headers.set(TURNSTILE_TOKEN_HEADER_NAME, captchaToken)

    return nativeFetch(new Request(request, { headers }))
  }

  isInitialized = true
}
