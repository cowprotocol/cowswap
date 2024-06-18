import { environmentName } from '@cowprotocol/common-utils'

import * as Sentry from '@sentry/react'

import { SENTRY_IGNORED_QUOTE_ERRORS } from 'api/cowProtocol/errors/QuoteError'

import { beforeSend } from './beforeSend'

import pkg from '../../../package.json'

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN
const SENTRY_TRACES_SAMPLE_RATE = process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE

if (SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing()],
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
