import {
  DEFAULT_TRACES_SAMPLE_RATE,
  getSentryOptions,
  parseSampleRate,
  redactBreadcrumb,
  redactEvent,
  REDACTED_WALLET,
  redactSpan,
  redactWalletAddresses,
} from './sentryOptions'

const SENTRY_ENV_KEYS = [
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_ENVIRONMENT',
  'NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE',
  'NEXT_PUBLIC_APP_VERSION',
] as const

describe('parseSampleRate', () => {
  it.each([
    ['0', 0],
    ['0.25', 0.25],
    ['1', 1],
  ])('parses %s', (value, expected) => {
    expect(parseSampleRate(value)).toBe(expected)
  })

  it.each([undefined, '', '  ', 'abc', '-0.1', '1.5', 'Infinity'])('falls back to the default for %p', (value) => {
    expect(parseSampleRate(value)).toBe(DEFAULT_TRACES_SAMPLE_RATE)
  })
})

describe('getSentryOptions', () => {
  const savedEnv = Object.fromEntries(SENTRY_ENV_KEYS.map((key) => [key, process.env[key]]))

  beforeEach(() => {
    SENTRY_ENV_KEYS.forEach((key) => delete process.env[key])
  })

  afterAll(() => {
    SENTRY_ENV_KEYS.forEach((key) => {
      const value = savedEnv[key]
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    })
  })

  it('keeps Sentry off without a DSN', () => {
    expect(getSentryOptions()).toBeNull()
  })

  it('builds the options from the environment', () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://key@o0.ingest.sentry.io/1'
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'preview'
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = '0.5'
    process.env.NEXT_PUBLIC_APP_VERSION = 'abc123'

    expect(getSentryOptions()).toMatchObject({
      dsn: 'https://key@o0.ingest.sentry.io/1',
      environment: 'preview',
      release: 'abc123',
      tracesSampleRate: 0.5,
    })
  })

  it('defaults the environment, release and sample rate', () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://key@o0.ingest.sentry.io/1'

    expect(getSentryOptions()).toMatchObject({
      dsn: 'https://key@o0.ingest.sentry.io/1',
      environment: 'development',
      release: 'dev',
      tracesSampleRate: DEFAULT_TRACES_SAMPLE_RATE,
    })
  })
})

describe('wallet address redaction', () => {
  const owner = '0x1111111111111111111111111111111111111111'
  const token = '0x2222222222222222222222222222222222222222'
  const sessionUrl = `https://balances-watcher.cow.fi/1/sessions/${owner}`
  const sseUrl = `https://balances-watcher.cow.fi/sse/1/balances/${owner}?client_id=abc`

  it.each([
    [sessionUrl, `https://balances-watcher.cow.fi/1/sessions/${REDACTED_WALLET}`],
    [sseUrl, `https://balances-watcher.cow.fi/sse/1/balances/${REDACTED_WALLET}?client_id=abc`],
    [`POST ${sessionUrl}`, `POST https://balances-watcher.cow.fi/1/sessions/${REDACTED_WALLET}`],
  ])('redacts the wallet in %s', (value, expected) => {
    expect(redactWalletAddresses(value)).toBe(expected)
  })

  it('keeps token addresses and longer hex values', () => {
    const tokenUrl = `https://api.geckoterminal.com/api/v2/networks/eth/tokens/${token}/ohlcv/day`
    const txHash = `/sessions/0x${'a'.repeat(64)}`

    expect(redactWalletAddresses(tokenUrl)).toBe(tokenUrl)
    expect(redactWalletAddresses(txHash)).toBe(txHash)
  })

  it('redacts fetch breadcrumbs', () => {
    const breadcrumb = redactBreadcrumb({
      category: 'fetch',
      message: `POST ${sessionUrl}`,
      data: { method: 'POST', url: sessionUrl, status_code: 500 },
    })

    expect(JSON.stringify(breadcrumb)).not.toContain(owner)
    expect(breadcrumb.data).toEqual({ method: 'POST', url: expect.stringContaining(REDACTED_WALLET), status_code: 500 })
  })

  it('redacts span names and attributes', () => {
    const span = redactSpan({
      trace_id: 't',
      span_id: 's',
      name: `POST ${sessionUrl}`,
      start_timestamp: 0,
      status: 'ok',
      is_segment: false,
      attributes: { 'url.full': sseUrl, 'http.response.status_code': 200 },
    })

    expect(JSON.stringify(span)).not.toContain(owner)
    expect(span.attributes['http.response.status_code']).toBe(200)
  })

  it('redacts the request url of error events', () => {
    const event = redactEvent({ type: undefined, request: { url: sessionUrl, method: 'POST' } })

    expect(event.request).toEqual({ url: expect.stringContaining(REDACTED_WALLET), method: 'POST' })
  })

  it('wires the redaction into the options', () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://key@o0.ingest.sentry.io/1'

    expect(getSentryOptions()).toMatchObject({
      dataCollection: { userInfo: false, cookies: false, httpBodies: [] },
      beforeBreadcrumb: redactBreadcrumb,
      beforeSendSpan: redactSpan,
      beforeSend: redactEvent,
    })
  })
})
