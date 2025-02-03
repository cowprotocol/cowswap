import { debounce } from '@cowprotocol/common-utils'

import { isValidGtmClickEvent } from './types'

import { AnalyticsContext, CowAnalytics, EventOptions, OutboundLinkParams } from '../CowAnalytics'
import { GtmEvent, Category } from '../types'

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
      page_params: params,
      ...this.getDimensions(),
    })
  }

  sendEvent(event: string | EventOptions, params?: unknown): void {
    const eventData: DataLayerEvent =
      typeof event === 'string'
        ? { event, ...(params as Record<string, unknown>) }
        : {
            // Create specific event name from category and action
            event: `${event.category.toLowerCase()}_${event.action.toLowerCase().replace(/\s+/g, '_')}`,

            // Core parameters at root level
            category: event.category,
            action: event.action,
            label: event.label,
            value: event.value,

            // Non-interaction flag
            non_interaction: event.nonInteraction,

            // Spread dimensions at root level
            ...this.getDimensions(),

            // Include additional dynamic properties if present
            ...((event as GtmEvent<Category>).orderId && { order_id: (event as GtmEvent<Category>).orderId }),
            ...((event as GtmEvent<Category>).orderType && { order_type: (event as GtmEvent<Category>).orderType }),
            ...((event as GtmEvent<Category>).tokenSymbol && {
              token_symbol: (event as GtmEvent<Category>).tokenSymbol,
            }),
            ...((event as GtmEvent<Category>).chainId && { chain_id: (event as GtmEvent<Category>).chainId }),
          }

    this.pushToDataLayer(eventData)
  }

  sendTiming(timingCategory: string, timingVar: string, timingValue: number, timingLabel: string): void {
    this.pushToDataLayer({
      event: 'timing_complete',
      timing_category: timingCategory,
      timing_variable: timingVar,
      timing_value: timingValue,
      timing_label: timingLabel,
      ...this.getDimensions(),
    })
  }

  sendError(error: Error, errorInfo?: string): void {
    this.pushToDataLayer({
      event: 'exception',
      error_description: error.toString() + (errorInfo ? ': ' + errorInfo : ''),
      error_fatal: true,
      ...this.getDimensions(),
    })
  }

  outboundLink({ label, hitCallback }: OutboundLinkParams): void {
    this.pushToDataLayer({
      event: 'outbound_link',
      outbound_label: label,
      ...this.getDimensions(),
    })

    // Execute callback after pushing to dataLayer
    if (hitCallback) {
      setTimeout(hitCallback, 0)
    }
  }

  /**
   * Sets an analytics dimension value.
   * @param key - The dimension key to set
   * @param value - The dimension value. Any value (including falsy values like '0' or '') will be stored,
   *               except undefined which will remove the dimension.
   */
  setContext(key: AnalyticsContext, value?: string): void {
    if (typeof value !== 'undefined') {
      this.dimensions[key] = value
    } else {
      delete this.dimensions[key]
    }
  }

  // Helper to push to dataLayer with proper typing
  private pushToDataLayer(data: DataLayerEvent): void {
    if (typeof window !== 'undefined') {
      // TODO: TEMPORARY - Remove after debugging
      console.log('🔍 Analytics Event:', {
        ...data,
        timestamp: new Date().toISOString(),
        stack: new Error().stack?.split('\n').slice(2).join('\n'), // Capture call stack but skip the first 2 lines (Error and this function)
      })

      this.dataLayer.push(data)
    }
  }

  // Get current dimensions as GTM-compatible object
  private getDimensions(): Record<string, string> {
    return Object.entries(this.dimensions).reduce(
      (acc, [key, value]) => {
        // Include all values that are not undefined
        if (typeof value !== 'undefined') {
          acc[`dimension_${key}`] = value
        }
        return acc
      },
      {} as Record<string, string>,
    )
  }
}
