import { CowAnalytics, setupEventHandlers } from '@cowprotocol/analytics'
import { CowWidgetEventPayloadMap, CowWidgetEvents, SimpleCowEventEmitter } from '@cowprotocol/events'

const getCowAnalytics = (): CowAnalytics | undefined => {
  if (typeof window !== 'undefined' && 'cowAnalyticsInstance' in window) {
    return window.cowAnalyticsInstance as CowAnalytics
  }
  return undefined
}

export const WIDGET_EVENT_EMITTER = new SimpleCowEventEmitter<CowWidgetEventPayloadMap, CowWidgetEvents>()

setupEventHandlers(WIDGET_EVENT_EMITTER, getCowAnalytics)
