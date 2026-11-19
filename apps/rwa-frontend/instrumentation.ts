import * as Sentry from '@sentry/nextjs'

import { getSentryOptions } from '@/_app/sentry'

export function register(): void {
  const options = getSentryOptions()

  if (options) Sentry.init(options)
}

export const onRequestError = Sentry.captureRequestError
