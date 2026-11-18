import type { BrowserOptions } from '@sentry/nextjs'

export type SentryOptions = Required<
  Pick<
    BrowserOptions,
    | 'dsn'
    | 'environment'
    | 'release'
    | 'tracesSampleRate'
    | 'dataCollection'
    | 'beforeBreadcrumb'
    | 'beforeSendSpan'
    | 'beforeSend'
  >
>

type Breadcrumb = Parameters<SentryOptions['beforeBreadcrumb']>[0]
type ErrorEvent = Parameters<SentryOptions['beforeSend']>[0]
type StreamedSpan = Parameters<SentryOptions['beforeSendSpan']>[0]

export const DEFAULT_TRACES_SAMPLE_RATE = 0.1

export const REDACTED_WALLET = '<wallet>'

// Balances watcher URLs carry the connected wallet: `/{chainId}/sessions/{owner}` and `/sse/{chainId}/balances/{owner}`
const WALLET_URL_SEGMENT = /(\/(?:sessions|balances)\/)0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/g

/** Options shared by the browser, Node.js and edge SDKs, or `null` to keep Sentry off when no DSN is set */
export function getSentryOptions(): SentryOptions | null {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

  if (!dsn) return null

  return {
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
    tracesSampleRate: parseSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
    dataCollection: { userInfo: false, cookies: false, httpHeaders: { response: false }, httpBodies: [] },
    beforeBreadcrumb: redactBreadcrumb,
    beforeSendSpan: redactSpan,
    beforeSend: redactEvent,
  }
}

/** A sample rate from 0 to 1; a missing or invalid value gives `DEFAULT_TRACES_SAMPLE_RATE` */
export function parseSampleRate(value: string | undefined): number {
  if (!value?.trim()) return DEFAULT_TRACES_SAMPLE_RATE

  const rate = Number(value)

  return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : DEFAULT_TRACES_SAMPLE_RATE
}

export function redactBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  return {
    ...breadcrumb,
    ...(breadcrumb.message !== undefined && { message: redactWalletAddresses(breadcrumb.message) }),
    ...(breadcrumb.data && { data: redactStrings(breadcrumb.data) }),
  }
}

export function redactEvent(event: ErrorEvent): ErrorEvent {
  if (!event.request?.url) return event

  return { ...event, request: { ...event.request, url: redactWalletAddresses(event.request.url) } }
}

export function redactSpan(span: StreamedSpan): StreamedSpan {
  return { ...span, name: redactWalletAddresses(span.name), attributes: redactStrings(span.attributes) }
}

export function redactWalletAddresses(value: string): string {
  return value.replace(WALLET_URL_SEGMENT, `$1${REDACTED_WALLET}`)
}

function redactStrings<T extends Record<string, unknown>>(record: T): T {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      typeof value === 'string' ? redactWalletAddresses(value) : value,
    ]),
  ) as T
}
