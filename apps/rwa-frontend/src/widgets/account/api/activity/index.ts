import { orderBookActivityProvider } from './orderBookActivityProvider'

import type { ActivityProvider } from './types'

export type { Activity, ActivityKind, ActivityProvider, ActivityQuery } from './types'

export const activityProvider: ActivityProvider = orderBookActivityProvider
