import { ErrorInfo } from 'react'

import { debounce } from '@cowprotocol/common-utils'

import ReactGA from 'react-ga4'
import { GaOptions, InitOptions, UaEventOptions } from 'react-ga4/types/ga4'

import { Dimensions } from '../types'

const DIMENSION_MAP = {
  [Dimensions.chainId]: 'dimension1',
  [Dimensions.walletName]: 'dimension2',
  [Dimensions.customBrowserType]: 'dimension3',
  [Dimensions.userAddress]: 'dimension4',
  [Dimensions.market]: 'dimension5',
  [Dimensions.injectedWidgetAppId]: 'dimension6',
}

type DimensionKey = keyof typeof DIMENSION_MAP

/**
 * Google Analytics Provider containing all methods used throughout app to log events to Google Analytics.
 */
export class GAProvider {
  dimensions: { [key in DimensionKey]: any }

  constructor() {
    this.dimensions = {
      chainId: '',
      walletName: '',
      customBrowserType: '',
      userAddress: '',
      market: '',
      injectedWidgetAppId: '',
    }
  }

  public sendEvent(event: string | UaEventOptions, params?: any) {
    if (typeof event === 'object') {
      event = { ...event, ...this.parseDimensions() }
    }

    ReactGA.event(event, params)
  }

  private parseDimensions() {
    const output: { [key: string]: any } = {}

    for (const [key, value] of Object.entries(this.dimensions)) {
      if (key in DIMENSION_MAP && value) {
        output[DIMENSION_MAP[key as DimensionKey]] = value
      }
    }

    return output
  }

  public sendError(error: Error, errorInfo: ErrorInfo) {
    ReactGA.event('exception', { description: error.toString() + errorInfo.toString(), fatal: true })
  }

  public initialize(
    GA_MEASUREMENT_ID: InitOptions[] | string,
    options?: {
      legacyDimensionMetric?: boolean
      nonce?: string
      testMode?: boolean
      gaOptions?: GaOptions | any
      gtagOptions?: any
    }
  ) {
    ReactGA.initialize(GA_MEASUREMENT_ID, options)
  }

  public set(fieldsObject: any) {
    ReactGA.set(fieldsObject)
  }

  public outboundLink(
    {
      label,
    }: {
      label: string
    },
    hitCallback: () => unknown
  ) {
    ReactGA.outboundLink({ label }, hitCallback)
  }

  public _pageview(page_path?: string, _?: string[], title?: string) {
    ReactGA.send({ hitType: 'pageview', page_path, title, ...this.parseDimensions() })
  }

  // debounced because otherwise it will be called 2 times
  // setTimeout because it will show the title of previous page until Helmet is loaded
  public pageview = debounce((page_path?: string, _?: string[], title?: string) => {
    setTimeout(() => this._pageview(page_path, _, title), 1000)
  })

  public ga(...args: any[]) {
    ReactGA.ga(...args)
  }

  public gaCommandSendTiming(timingCategory: any, timingVar: any, timingValue: any, timingLabel: any) {
    ReactGA._gaCommandSendTiming(timingCategory, timingVar, timingValue, timingLabel)
  }

  public setDimension(key: DimensionKey, value: any) {
    this.dimensions[key] = value
  }
}
