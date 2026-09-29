import { getCowAnalytics } from './utils'

import type { EventOptions } from './CowAnalytics'

type CowTracker = (event: CowTrackerEvent) => void
type CowTrackerEvent = Omit<EventOptions, 'category'> & Record<string, unknown>

export function createCowTracker(category: string): CowTracker {
  return (event) => {
    getCowAnalytics()?.sendEvent({ category, ...event })
  }
}
