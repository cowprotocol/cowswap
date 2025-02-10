import { environmentName } from '@cowprotocol/common-utils'

import * as Sentry from '@sentry/react'

import { SENTRY_IGNORED_QUOTE_ERRORS } from 'api/cowProtocol/errors/QuoteError'

import { beforeSend } from './beforeSend'
import { NO_DEDUP_EVENTS } from './events'

import pkg from '../../../package.json'

import type { Event } from '@sentry/types'

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN
const SENTRY_TRACES_SAMPLE_RATE = process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE

/**
 * Extended Dedupe class that allows to skip deduplication for specific events
 */
class SentryDedupeLocal extends Sentry.Dedupe {
  processEvent(currentEvent: Event): Event | null {
    if (currentEvent.message && NO_DEDUP_EVENTS.includes(currentEvent.message)) {
      return currentEvent
    }

    return super.processEvent(currentEvent)
  }
}

if (SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    defaultIntegrations: [
      new Sentry.InboundFilters(),
      new Sentry.FunctionToString(),
      new Sentry.TryCatch(),
      new Sentry.Breadcrumbs(),
      new Sentry.GlobalHandlers(),
      new Sentry.LinkedErrors(),
      new SentryDedupeLocal(),
      new Sentry.HttpContext(),
      new Sentry.BrowserTracing(),
    ],
    release: 'CowSwap@v' + pkg.version,
    environment: environmentName,
    ignoreErrors: [...SENTRY_IGNORED_QUOTE_ERRORS, `Can't find variable: bytecode`],
    beforeSend,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE ? Number(SENTRY_TRACES_SAMPLE_RATE) : 1.0,
  })
}
