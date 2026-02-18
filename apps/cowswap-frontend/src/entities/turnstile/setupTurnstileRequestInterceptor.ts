import { TURNSTILE_API_HOSTS, TURNSTILE_TOKEN_HEADER_NAME } from './const'
import { getTurnstileToken } from './state/turnstileTokenAtom'

const TURNSTILE_API_HOSTS_SET = new Set(TURNSTILE_API_HOSTS)

let isTurnstileRequestInterceptorInitialized = false

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()

  return input.url
}

function shouldAttachTurnstileToken(url: URL, method: string): boolean {
  if (!TURNSTILE_API_HOSTS_SET.has(url.hostname)) return false

  if (method !== 'POST') return false

  return url.pathname.endsWith('/api/v1/quote')
}

export function setupTurnstileRequestInterceptor(): void {
  if (typeof window === 'undefined') return
  if (isTurnstileRequestInterceptorInitialized) return

  const nativeFetch = window.fetch.bind(window)

  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const turnstileToken = getTurnstileToken()

    if (!turnstileToken) {
      return nativeFetch(input, init)
    }

    let request: Request
    try {
      request = new Request(input, init)
    } catch {
      return nativeFetch(input, init)
    }
    const inputUrl = getRequestUrl(request)
    const baseUrl = typeof window.location?.origin === 'string' ? window.location.origin : 'http://localhost'

    let url: URL
    try {
      url = new URL(inputUrl, baseUrl)
    } catch {
      return nativeFetch(request)
    }

    if (!shouldAttachTurnstileToken(url, request.method.toUpperCase())) {
      return nativeFetch(request)
    }

    const headers = new Headers(request.headers)
    headers.set(TURNSTILE_TOKEN_HEADER_NAME, turnstileToken)

    return nativeFetch(new Request(request, { headers }))
  }

  isTurnstileRequestInterceptorInitialized = true
}
