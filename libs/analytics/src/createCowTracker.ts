import { getCowAnalytics } from './utils'

import type { EventOptions } from './CowAnalytics'

type CowTrackerEvent = Omit<EventOptions, 'category'> & Record<string, unknown>
type CowTracker = (event: CowTrackerEvent) => void

type CowTrackerOptions = {
  enabled?: boolean
}

export function createCowTracker(category: string, options: CowTrackerOptions = {}): CowTracker {
  const { enabled = true } = options

  return (event) => {
    if (!enabled) return

    getCowAnalytics()?.sendEvent({ category, ...event })
  }
}
