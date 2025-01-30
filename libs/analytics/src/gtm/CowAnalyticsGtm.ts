import { debounce } from '@cowprotocol/common-utils'

import { isValidGtmClickEvent } from './types'

import { AnalyticsContext, CowAnalytics, EventOptions, OutboundLinkParams } from '../CowAnalytics'

interface DataLayerEvent extends Record<string, unknown> {
  event: string
}

type DataLayer = DataLayerEvent[]

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

/**
 * GTM Analytics Provider implementing the CowAnalytics interface
 * Maintains compatibility with existing analytics while using GTM's dataLayer
 */
export class CowAnalyticsGtm implements CowAnalytics {
  private dimensions: Record<string, string> = {}
  private debouncedPageView: (path?: string, params?: string[], title?: string) => void
  private dataLayer: DataLayer

  constructor() {
    // Initialize dataLayer
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      this.dataLayer = window.dataLayer as DataLayer

      // Add global click listener for data attributes
      window.addEventListener('click', this.handleDataAttributeClick.bind(this), true)
    } else {
      this.dataLayer = []
    }

    // Initialize debounced page view
    this.debouncedPageView = debounce((path?: string, params?: string[], title?: string) => {
      setTimeout(() => this._sendPageView(path, params, title), 1000)
    })
  }

  // Handle clicks on elements with data-click-event attribute
  private handleDataAttributeClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    const clickEventElement = target.closest('[data-click-event]')

    if (!clickEventElement) return

    const eventData = clickEventElement.getAttribute('data-click-event')
    if (!eventData) return

    try {
      const parsedEvent = JSON.parse(eventData)
      if (isValidGtmClickEvent(parsedEvent)) {
        this.sendEvent(parsedEvent)
      }
    } catch (error) {
      console.warn('Failed to parse GTM click event:', error)
    }
  }

  setUserAccount(account: string | undefined): void {
    this.setContext(AnalyticsContext.userAddress, account || 'disconnected')
    this.pushToDataLayer({
      event: 'set_user_account',
      userId: account || undefined,
    })
  }

  sendPageView(path?: string, params?: string[], title?: string): void {
    this.debouncedPageView(path, params, title)
  }

  private _sendPageView(path?: string, params?: string[], title?: string): void {
    this.pushToDataLayer({
      event: 'page_view',
      page_path: path,
      page_title: title,
      dimensions: this.getDimensions(),
    })
  }

  sendEvent(event: string | EventOptions, params?: unknown): void {
    const eventData: DataLayerEvent =
      typeof event === 'string'
        ? { event, ...(params as Record<string, unknown>) }
        : {
            event: 'custom_event',
            eventCategory: event.category,
            eventAction: event.action,
            eventLabel: event.label,
            eventValue: event.value,
            nonInteraction: event.nonInteraction,
            dimensions: this.getDimensions(),
          }

    this.pushToDataLayer(eventData)
  }

  sendTiming(timingCategory: string, timingVar: string, timingValue: number, timingLabel: string): void {
    this.pushToDataLayer({
      event: 'timing_complete',
      timingCategory,
      timingVar,
      timingValue,
      timingLabel,
      dimensions: this.getDimensions(),
    })
  }

  sendError(error: Error, errorInfo?: string): void {
    this.pushToDataLayer({
      event: 'exception',
      exDescription: error.toString() + (errorInfo ? ': ' + errorInfo : ''),
      exFatal: true,
      dimensions: this.getDimensions(),
    })
  }

  outboundLink({ label, hitCallback }: OutboundLinkParams): void {
    this.pushToDataLayer({
      event: 'outbound_link',
      outboundLabel: label,
      dimensions: this.getDimensions(),
    })

    // Execute callback after pushing to dataLayer
    if (hitCallback) {
      setTimeout(hitCallback, 0)
    }
  }

  setContext(key: AnalyticsContext, value?: string): void {
    if (value) {
      this.dimensions[key] = value
    } else {
      delete this.dimensions[key]
    }
  }

  // Helper to push to dataLayer with proper typing
  private pushToDataLayer(data: DataLayerEvent): void {
    if (typeof window !== 'undefined') {
      this.dataLayer.push(data)
    }
  }

  // Get current dimensions as GTM-compatible object
  private getDimensions(): Record<string, string> {
    return Object.entries(this.dimensions).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[`dimension_${key}`] = value
        }
        return acc
      },
      {} as Record<string, string>,
    )
  }
}
