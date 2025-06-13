import * as Sentry from '@sentry/react'
import { ErrorEvent as SentryErrorEvent } from '@sentry/types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function beforeSend(event: SentryErrorEvent, _hint: Sentry.EventHint) {
  if (shouldIgnoreErrorBasedOnExtra(event)) {
    return null
  } else if (shouldIgnoreErrorBasedOnBreadcrumbs(event)) {
    return null
  } else {
    return event
  }
}

/**
 * Ignore sentry errors that are unhandled exceptions and have extra serialized that similar to:
 *
 * {
 *   code: -32000,
 *   message: header not found
 * }
 */
function shouldIgnoreErrorBasedOnExtra(error: SentryErrorEvent): boolean {
  const serialized = error.extra?.__serialized__

  return Boolean(
    serialized &&
      typeof serialized === 'object' &&
      'code' in serialized &&
      serialized.code &&
      typeof serialized.code === 'number' &&
      EXTRA_ERROR_CODES_TO_IGNORE.has(serialized.code)
  )
}

const EXTRA_ERROR_CODES_TO_IGNORE = new Set([-32000, 4001, -32603])

/**
 * Detects whether given error is a load failed error
 *
 * Adapted from https://gist.github.com/jeengbe/4bc86f05a41a1831e6abf2369579cc7a
 */
function shouldIgnoreErrorBasedOnBreadcrumbs(error: SentryErrorEvent): boolean {
  const exception = error.exception?.values?.[0]
  const breadcrumbs = error.breadcrumbs

  if (
    !exception?.type ||
    !breadcrumbs ||
    !isTypeError(exception.type, exception?.value) ||
    !isUnhandledRejectionError(exception.type)
  ) {
    return false
  }

  return searchBreadcrumbs(breadcrumbs, [isFetchError, isMetamaskRpcError])
}

function isTypeError(type: string, value: string | undefined): boolean {
  return !!value && type === 'TypeError' && TYPE_ERROR_FETCH_FAILED_VALUES.has(value)
}

function isUnhandledRejectionError(type: string): boolean {
  return type === 'UnhandledRejection'
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function searchBreadcrumbs(breadcrumbs: Sentry.Breadcrumb[], checkBreadcrumbs: CheckBreadcrumb[]) {
  const now = Date.now()

  // We go from the back since the last breadcrumb is most likely the erroneous one
  for (let i = breadcrumbs.length - 1; i >= 0; i--) {
    const breadcrumb = breadcrumbs[i]
    if (!breadcrumb) continue

    // We only need to check the last 3s of breadcrumbs as any earlier breadcrumbs are definitely unrelated
    if (breadcrumb.timestamp && now - breadcrumb.timestamp * 1000 > 3000) {
      break
    }

    if (checkBreadcrumbs.some((fn) => fn(breadcrumb))) {
      return true
    }
  }

  return false
}

type CheckBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => boolean

const TYPE_ERROR_FETCH_FAILED_VALUES = new Set([
  'Failed to fetch',
  'NetworkError when attempting to fetch resource.',
  'Load failed',
])

function isFetchError(breadcrumb: Sentry.Breadcrumb): boolean {
  if (breadcrumb.level !== 'error' || (breadcrumb.category !== 'xhr' && breadcrumb.category !== 'fetch')) {
    return false
  }

  const url = breadcrumb.data?.url as string | undefined
  if (!url) return false

  return URLS_TO_IGNORE_FETCH_ERRORS.test(url)
}

const URLS_TO_IGNORE_FETCH_ERRORS =
  /(twnodes\.com)|(assets\/cow-no-connection)|(api\.blocknative\.com)|(api\.country\.is)|(nodereal\.io)|(wallet\.coinbase\.com)|(cowprotocol\/cowswap-banner)/i

function isMetamaskRpcError(breadcrumb: Sentry.Breadcrumb): boolean {
  if (breadcrumb.level !== 'error' || !breadcrumb.message) {
    return false
  }
  return /MetaMask.*RPC Error/i.test(breadcrumb.message)
}
