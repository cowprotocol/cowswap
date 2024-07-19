import { debounce } from '@cowprotocol/common-utils'

import ReactGA from 'react-ga4'

import { AnalyticsContext, CowAnalytics, EventOptions, OutboundLinkParams } from '../CowAnalytics'

const DIMENSION_MAP = {
  [AnalyticsContext.chainId]: 'dimension1',
  [AnalyticsContext.walletName]: 'dimension2',
  [AnalyticsContext.customBrowserType]: 'dimension3',
  [AnalyticsContext.userAddress]: 'dimension4',
  [AnalyticsContext.market]: 'dimension5',
  [AnalyticsContext.injectedWidgetAppId]: 'dimension6',
} as const
type CowDimensionKey = keyof typeof DIMENSION_MAP
type CowDimensionValues = { [key in CowDimensionKey]: string }

export interface CowAnalyticsGoogleParams {
  googleAnalyticsId?: string
  options?: {
    legacyDimensionMetric?: boolean
    nonce?: string
    testMode?: boolean
    gaOptions?: unknown
    gtagOptions?: any
  }
}

/**
 * Google Analytics Provider containing all methods used throughout app to log events to Google Analytics.
 */
export class CowAnalyticsGoogle implements CowAnalytics {
  dimensions: CowDimensionValues

  constructor(params: CowAnalyticsGoogleParams) {
    const { googleAnalyticsId: googleAnalyticsIdParam, options: optionsProd } = params
    const [googleAnalyticsId, options] = googleAnalyticsIdParam
      ? [googleAnalyticsIdParam, optionsProd]
      : ['test', { gtagOptions: { debug_mode: true } }]

    // Init dimensions
    const dimensionKeys = Object.keys(DIMENSION_MAP) as CowDimensionKey[]
    this.dimensions = dimensionKeys.reduce<CowDimensionValues>((acc, dimension) => {
      acc[dimension] = ''
      return acc
    }, {} as CowDimensionValues)

    // Init Google analytics
    console.log('[CowAnalyticsGoogle] Init analytics: ', googleAnalyticsId)
    ReactGA.initialize(googleAnalyticsId, options)
  }
  setUserAccount(account: string | undefined): void {
    // Custom dimension 4 - user id - because ReactGA.set might not be working
    const userId = account ? `"${account}"` : null
    this.setContext(AnalyticsContext.userAddress, userId || 'disconnected')

    ReactGA.set({ userId })
  }

  public sendEvent(event: string | EventOptions, params?: any) {
    if (typeof event === 'object') {
      event = { ...event, ...this.parseDimensions() }
    }

    ReactGA.event(event, params)
  }

  public sendError(error: Error, errorInfo?: string) {
    const errorDescription = error.toString() + (errorInfo?.toString() + '')
    ReactGA.event('exception', { description: errorDescription, fatal: true })
  }

  sendTiming(timingCategory: string, timingVar: string, timingValue: number, timingLabel: string): void {
    ReactGA._gaCommandSendTiming(timingCategory, timingVar, timingValue, timingLabel)
  }

  private set(fieldsObject: any) {
    ReactGA.set(fieldsObject)
  }

  public outboundLink({ label, hitCallback }: OutboundLinkParams) {
    ReactGA.outboundLink({ label }, hitCallback)
  }

  // debounced because otherwise it will be called 2 times
  // setTimeout because it will show the title of previous page until Helmet is loaded
  public sendPageView = debounce((page_path?: string, params?: string[], title?: string) => {
    setTimeout(() => this._pageview(page_path, params, title), 1000)
  })

  private _pageview(page_path?: string, _?: string[], title?: string) {
    ReactGA.send({ hitType: 'pageview', page_path, title, ...this.parseDimensions() })
  }

  public ga(...args: any[]) {
    ReactGA.ga(...args)
  }

  public setContext(key: AnalyticsContext, value: string): void {
    if (!isDimension(key)) {
      throw new Error('Unknown dimension')
    }

    this.dimensions[key] = value
  }
  private setDimension(key: CowDimensionKey, value: any) {
    this.dimensions[key] = value
  }

  private parseDimensions() {
    const output: Record<string, string> = {}
    for (const [key, value] of Object.entries(this.dimensions)) {
      if (key in DIMENSION_MAP && value) {
        const actualDimensionName = DIMENSION_MAP[key as CowDimensionKey]
        output[actualDimensionName] = value
      }
    }

    return output
  }
}

function isDimension(dimension: string): dimension is CowDimensionKey {
  return !!DIMENSION_MAP[dimension as CowDimensionKey]
}
