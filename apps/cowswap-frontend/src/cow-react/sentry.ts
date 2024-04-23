import { environmentName } from '@cowprotocol/common-utils'

import * as Sentry from '@sentry/react'
import { ErrorEvent as SentryErrorEvent } from '@sentry/types'

import { SENTRY_IGNORED_GP_QUOTE_ERRORS } from 'api/gnosisProtocol/errors/QuoteError'

// eslint-disable-next-line @nx/enforce-module-boundaries
import pkg from '../../package.json'

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN
const SENTRY_TRACES_SAMPLE_RATE = process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE

if (SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing()],
    release: 'CowSwap@v' + pkg.version,
    environment: environmentName,
    ignoreErrors: [...SENTRY_IGNORED_GP_QUOTE_ERRORS, `Can't find variable: bytecode`],
    beforeSend: (event: SentryErrorEvent, _hint: Sentry.EventHint) => {
      if (isLoadFailedError(event)) {
        console.debug('Sentry: Ignoring Apple device load failed error', event)
        return null
      } else {
        return event
      }
    },
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE ? Number(SENTRY_TRACES_SAMPLE_RATE) : 1.0,
  })
}

/**
 * Detects whether given error is a load failed error
 *
 * Adapted from https://gist.github.com/jeengbe/4bc86f05a41a1831e6abf2369579cc7a
 */
function isLoadFailedError(error: SentryErrorEvent): boolean {
  const exception = error.exception?.values?.[0]
  const breadcrumbs = error.breadcrumbs

  if (
    exception?.type !== 'TypeError' ||
    !exception?.value ||
    !TYPE_ERROR_FETCH_FAILED_VALUES.has(exception.value) ||
    !breadcrumbs
  ) {
    return false
  }

  const now = Date.now()

  // We go from the back since the last breadcrumb is most likely the erroneous one
  for (let i = breadcrumbs.length - 1; i >= 0; i--) {
    const breadcrumb = breadcrumbs[i]
    if (!breadcrumb) continue

    // We only need to check the last 3s of breadcrumbs as any earlier breadcrumbs are definitely unrelated
    if (breadcrumb.timestamp && now - breadcrumb.timestamp * 1000 > 3000) {
      break
    }

    if (isErroneousBreadcrumb(breadcrumb)) {
      return true
    }
  }

  return false
}

const TYPE_ERROR_FETCH_FAILED_VALUES = new Set([
  'Failed to fetch',
  'NetworkError when attempting to fetch resource.',
  'Load failed',
])

function isErroneousBreadcrumb(breadcrumb: Sentry.Breadcrumb): boolean {
  if (breadcrumb.level !== 'error' || (breadcrumb.category !== 'xhr' && breadcrumb.category !== 'fetch')) {
    return false
  }

  const url = breadcrumb.data?.url as string | undefined
  if (!url) return false

  return URLS_TO_IGNORE_FETCH_ERRORS.test(url)
}

const URLS_TO_IGNORE_FETCH_ERRORS =
  /(twnodes\.com)|(assets\/cow-no-connection)|(api\.blocknative\.com)|(api\.country\.is)|(nodereal\.io)|(wallet\.coinbase\.com)|(cowprotocol\/cowswap-banner)/i
