import * as Sentry from '@sentry/nextjs'

import { getSentryOptions } from '@/shared/lib/sentry'

const options = getSentryOptions()

if (options) Sentry.init(options)

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
