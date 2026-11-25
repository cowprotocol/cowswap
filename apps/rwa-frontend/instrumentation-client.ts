import * as Sentry from '@sentry/nextjs'

import { getSentryOptions } from '@/_app/sentry'

const options = getSentryOptions()

if (options) Sentry.init(options)

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
