import { CaptchaExchangeError, exchangeTurnstileToken, isTurnstileTimeoutOrDuplicate } from './captchaApi'

describe('exchangeTurnstileToken', () => {
  const fetchMock = jest.fn()
  const originalFetch = global.fetch

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock as typeof fetch
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it('returns the exchanged JWT', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ jwt: 'header.payload.signature' }, 200))

    await expect(exchangeTurnstileToken('turnstile-token')).resolves.toBe('header.payload.signature')
  })

  it('surfaces the response code when the exchange is rejected', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 'timeout-or-duplicate', error: 'Invalid turnstile token' }, 403))

    const error = await exchangeTurnstileToken('turnstile-token').catch((err: unknown) => err)

    expect(error).toBeInstanceOf(CaptchaExchangeError)
    expect(error).toMatchObject({ code: 'timeout-or-duplicate', message: 'Invalid turnstile token' })
    expect(isTurnstileTimeoutOrDuplicate(error)).toBe(true)
  })

  it('rejects other exchange failures without the timeout code', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'Invalid turnstile token' }, 403))

    const error = await exchangeTurnstileToken('turnstile-token').catch((err: unknown) => err)

    expect(error).toBeInstanceOf(CaptchaExchangeError)
    expect(isTurnstileTimeoutOrDuplicate(error)).toBe(false)
  })
})

function jsonResponse(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response
}
