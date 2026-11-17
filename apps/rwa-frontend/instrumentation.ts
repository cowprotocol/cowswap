import * as Sentry from '@sentry/nextjs'

import { getSentryOptions } from '@/shared/lib/sentry'

export function register(): void {
  const options = getSentryOptions()

  if (options) Sentry.init(options)
}

export const onRequestError = Sentry.captureRequestError
