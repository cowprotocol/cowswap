import type { BrowserOptions } from '@sentry/nextjs'

export type SentryOptions = Required<Pick<BrowserOptions, 'dsn' | 'environment' | 'release' | 'tracesSampleRate'>>

export const DEFAULT_TRACES_SAMPLE_RATE = 0.1

/** Options shared by the browser, Node.js and edge SDKs, or `null` to keep Sentry off when no DSN is set */
export function getSentryOptions(): SentryOptions | null {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

  if (!dsn) return null

  return {
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
    tracesSampleRate: parseSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
  }
}

/** A sample rate from 0 to 1; a missing or invalid value gives `DEFAULT_TRACES_SAMPLE_RATE` */
export function parseSampleRate(value: string | undefined): number {
  if (!value?.trim()) return DEFAULT_TRACES_SAMPLE_RATE

  const rate = Number(value)

  return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : DEFAULT_TRACES_SAMPLE_RATE
}
