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
      if (isAppleDeviceLoadFailedError(event)) {
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

function isAppleDeviceLoadFailedError(error: SentryErrorEvent): boolean {
  const exception = error.exception?.values?.[0]
  const os = error.tags?.['os.name']
  if (
    exception?.type !== 'TypeError' ||
    !exception?.value ||
    !TYPE_ERROR_FETCH_FAILED_VALUES.has(exception.value) ||
    !os
  ) {
    return false
  }

  return typeof os === 'string' && APPLE_OSES.has(os)
}

const TYPE_ERROR_FETCH_FAILED_VALUES = new Set([
  'Failed to fetch',
  'NetworkError when attempting to fetch resource.',
  'Load failed',
])

const APPLE_OSES = new Set(['iOS', 'Mac OS X'])
