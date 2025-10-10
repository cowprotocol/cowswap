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

  private cleanup = (): void => {
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

  destroy(): void {
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
  setUserAccount(account: string | undefined, walletName?: string): void {
    this.setContext(AnalyticsContext.userAddress, account || 'disconnected')

    // Basic user account tracking
    this.pushToDataLayer({
      event: 'set_user_account',
      userId: account || undefined,
    })

    // Enhanced wallet connection tracking: detect disconnect/connect/switch flows
    if (this.previousAccount && !account) {
      this.handleWalletDisconnection()
    } else if (account) {
      this.handleWalletConnection(account, walletName)
    }

    // Update the previous account reference
    this.previousAccount = account
  }

  private handleWalletDisconnection(): void {
    // Wallet disconnection (account transitioned to undefined)
    this.pushToDataLayer({
      event: 'wallet_disconnected',
      eventType: 'wallet_disconnection',
      previousWalletAddress: this.previousAccount,
      previousWalletName: this.dimensions[AnalyticsContext.walletName] || 'Unknown',
    })
  }

  private handleWalletConnection(account: string, walletName?: string): void {
    const walletNameToUse = walletName || this.dimensions[AnalyticsContext.walletName] || 'Unknown'
    const commonEventProps = {
      walletAddress: account,
      walletName: walletNameToUse,
    }

    if (!this.previousAccount) {
      // First wallet connection for this session
      this.pushToDataLayer({
        event: 'wallet_connected',
        eventType: 'wallet_initial_connection',
        ...commonEventProps,
      })
    } else if (this.previousAccount !== account) {
      // Wallet switched to a new address
      this.pushToDataLayer({
        event: 'wallet_switched',
        eventType: 'wallet_switch',
        previousWalletAddress: this.previousAccount,
        previousWalletName: this.dimensions[AnalyticsContext.walletName] || 'Unknown',
        ...commonEventProps,
      })
    }

    this.setContext(AnalyticsContext.walletName, walletNameToUse)
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
    const gtmEvent = event as GtmEvent<Category>

    if (typeof event === 'string') {
      // Simple events inherit the current global dimensions and pass through untouched
      const payload = {
        event,
        ...this.getDimensions(),
        ...((typeof params === 'object' && params !== null ? params : {}) as Record<string, unknown>),
      }

      this.pushToDataLayer(payload)
      return
    }

    const {
      category,
      action,
      label,
      value,
      nonInteraction,
      orderId,
      orderType,
      tokenSymbol,
      chainId,
      isBridgeOrder,
      ...additionalParams
    } = gtmEvent

    const sanitizedAdditionalParams = Object.entries(additionalParams).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, unknown>,
    )

    const eventData: DataLayerEvent = {
      event: action,
      category,
      action,
      label,
      value,
      non_interaction: nonInteraction,
      ...this.getDimensions(),
      ...(isBridgeOrder && { isBridgeOrder }),
      ...(orderId && { order_id: orderId }),
      ...(orderType && { order_type: orderType }),
      ...(tokenSymbol && { token_symbol: tokenSymbol }),
      ...(chainId && { chain_id: chainId }),
      ...sanitizedAdditionalParams,
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

      // Preserve a local copy and forward the event for GTM consumption
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
