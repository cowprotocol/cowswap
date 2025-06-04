import { debounce } from '@cowprotocol/common-utils'

import { AnalyticsContext, CowAnalytics, EventOptions, OutboundLinkParams } from '../CowAnalytics'
import { GtmEvent, Category } from '../types'

interface DataLayerEvent extends Record<string, unknown> {
  event: string
}

type DataLayer = DataLayerEvent[]

declare global {
  interface Window {
    dataLayer: unknown[]
    cowAnalyticsInstance?: CowAnalyticsGtm // For singleton pattern
  }
}

/**
 * GTM Analytics Provider implementing the CowAnalytics interface
 *
 * IMPORTANT: This implementation relies on Google Tag Manager (GTM) for click tracking.
 *
 * === GTM SETUP INSTRUCTIONS ===
 *
 * 1. Create a new GTM Trigger:
 *    - Trigger Type: "All Elements"
 *    - This trigger fires on: "Click"
 *    - Fire on: "Some Clicks"
 *    - Condition: "Click Element" matches CSS selector "[data-click-event]"
 *
 * 2. Create GTM Variables to extract data-click-event contents:
 *    - Variable Type: "Custom JavaScript"
 *    - Function should parse the data-click-event attribute:
 *    ```javascript
 *    function() {
 *      var clickElement = {{Click Element}};
 *      if (!clickElement) return;
 *
 *      var eventData = clickElement.getAttribute('data-click-event');
 *      if (!eventData) return;
 *
 *      try {
 *        return JSON.parse(eventData);
 *      } catch(e) {
 *        console.error('Failed to parse click event data:', e);
 *        return null;
 *      }
 *    }
 *    ```
 *
 * 3. Create GTM Tag:
 *    - Tag Type: "Google Analytics: GA4 Event"
 *    - Event Name: {{ClickEvent.action}} (using the variable created above)
 *    - Parameters to include:
 *      - event_category: {{ClickEvent.category}}
 *      - event_label: {{ClickEvent.label}}
 *      - event_value: {{ClickEvent.value}}
 *      - order_id: {{ClickEvent.orderId}}
 *      - order_type: {{ClickEvent.orderType}}
 *      - token_symbol: {{ClickEvent.tokenSymbol}}
 *      - chain_id: {{ClickEvent.chainId}}
 *
 * === USAGE IN CODE ===
 *
 * Add data-click-event attribute to elements you want to track:
 * ```tsx
 * <button
 *   data-click-event={toCowSwapGtmEvent({
 *     category: CowSwapAnalyticsCategory.WALLET,
 *     action: 'Connect wallet button click',
 *     label: connectionType
 *   })}
 * >
 *   Connect Wallet
 * </button>
 * ```
 *
 * The data-click-event attribute will be automatically picked up by GTM
 * when a user clicks the element. No additional JavaScript handling is needed.
 */
export class CowAnalyticsGtm implements CowAnalytics {
  private dimensions: Record<string, string> = {}
  private debouncedPageView = debounce((path?: string, params?: string[], title?: string) => {
    this._sendPageView(path, params, title)
  }, 1000)
  private dataLayer: DataLayer = []
  private previousAccount: string | undefined = undefined

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private cleanup = () => {
    window.cowAnalyticsInstance = undefined
  }

  constructor() {
    if (typeof window !== 'undefined') {
      if (window.cowAnalyticsInstance) {
        throw new Error('CowAnalyticsGtm instance already exists - use initGtm() instead')
      }

      window.cowAnalyticsInstance = this
      window.dataLayer = window.dataLayer || []
      this.dataLayer = window.dataLayer as DataLayer

      window.addEventListener('unload', this.cleanup)
    }
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('unload', this.cleanup)
    }
  }

  /**
   * Sets the user account for analytics tracking and tracks wallet connection events.
   *
   * This method:
   * 1. Sets the user address in the analytics context
   * 2. Pushes a 'set_user_account' event to the data layer
   * 3. Tracks wallet connection events:
   *    - 'wallet_connected' for initial connections
   *    - 'wallet_switched' when switching between accounts
   *    - 'wallet_disconnected' when disconnecting a wallet
   *    - Includes metadata like wallet name and previous address
   *
   * @param account The user's wallet address or undefined if disconnected
   * @param walletName Optional wallet name (e.g., 'MetaMask', 'WalletConnect')
   */
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  setUserAccount(account: string | undefined, walletName?: string): void {
    this.setContext(AnalyticsContext.userAddress, account || 'disconnected')

    // Basic user account tracking
    this.pushToDataLayer({
      event: 'set_user_account',
      userId: account || undefined,
    })

    // Enhanced wallet connection tracking
    // Case 1: Wallet disconnection (account changes from defined to undefined)
    if (this.previousAccount && !account) {
      this.pushToDataLayer({
        event: 'wallet_disconnected',
        eventType: 'wallet_disconnection',
        previousWalletAddress: this.previousAccount,
        previousWalletName: this.dimensions[AnalyticsContext.walletName] || 'Unknown',
      })
    }
    // Case 2: Wallet connection/switching (account is defined)
    else if (account) {
      // Get wallet name from context if not provided
      const walletNameToUse = walletName || this.dimensions[AnalyticsContext.walletName] || 'Unknown'

      // Common properties for wallet events
      const commonEventProps = {
        walletAddress: account,
        walletName: walletNameToUse,
      }

      // Initial connection (account changes from undefined/null to defined)
      if (!this.previousAccount) {
        this.pushToDataLayer({
          event: 'wallet_connected',
          eventType: 'wallet_initial_connection',
          ...commonEventProps,
        })
      }
      // Wallet switched (account changes from one defined value to another)
      else if (this.previousAccount !== account) {
        this.pushToDataLayer({
          event: 'wallet_switched',
          eventType: 'wallet_switch',
          previousWalletAddress: this.previousAccount,
          ...commonEventProps,
        })
      }
    }

    // Update the previous account reference
    this.previousAccount = account
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
            event: event.action,
            category: event.category,
            action: event.action,
            label: event.label,
            value: event.value,
            non_interaction: event.nonInteraction,
            ...this.getDimensions(),
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

    if (hitCallback) {
      setTimeout(hitCallback, 0)
    }
  }

  setContext(key: AnalyticsContext, value?: string): void {
    if (typeof value !== 'undefined') {
      this.dimensions[key] = value
    } else {
      delete this.dimensions[key]
    }
  }

  private pushToDataLayer(data: DataLayerEvent): void {
    if (typeof window !== 'undefined') {
      const dataLayerEvent = { ...data }

      // Debug log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.debug('[GTM] Pushing to data layer:', dataLayerEvent)
      }

      this.dataLayer.push(dataLayerEvent)
    }
  }

  private getDimensions(): Record<string, string> {
    return Object.entries(this.dimensions).reduce(
      (acc, [key, value]) => {
        if (typeof value !== 'undefined') {
          acc[`dimension_${key}`] = value
        }
        return acc
      },
      {} as Record<string, string>,
    )
  }
}
