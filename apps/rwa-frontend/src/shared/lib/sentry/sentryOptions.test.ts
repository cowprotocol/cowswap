import { DEFAULT_TRACES_SAMPLE_RATE, getSentryOptions, parseSampleRate } from './sentryOptions'

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

    expect(getSentryOptions()).toEqual({
      dsn: 'https://key@o0.ingest.sentry.io/1',
      environment: 'preview',
      release: 'abc123',
      tracesSampleRate: 0.5,
    })
  })

  it('defaults the environment, release and sample rate', () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://key@o0.ingest.sentry.io/1'

    expect(getSentryOptions()).toEqual({
      dsn: 'https://key@o0.ingest.sentry.io/1',
      environment: 'development',
      release: 'dev',
      tracesSampleRate: DEFAULT_TRACES_SAMPLE_RATE,
    })
  })
})
