import ReactGA from 'react-ga4'
import { ErrorInfo } from 'react'
import { GaOptions, InitOptions, UaEventOptions } from 'react-ga4/types/ga4'

export enum Dimensions {
  chainId = 'chainId',
  walletName = 'walletName',
}

const DIMENSION_MAP = {
  [Dimensions.chainId]: 'dimension1',
  [Dimensions.walletName]: 'dimension2',
}

type DimensionKey = keyof typeof DIMENSION_MAP

/**
 * Google Analytics Provider containing all methods used throughout app to log events to Google Analytics.
 */
export default class GoogleAnalyticsProvider {
  dimensions: { [key in DimensionKey]: any }

  constructor() {
    this.dimensions = { chainId: '', walletName: '' }
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
      if (key in DIMENSION_MAP) {
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

  public pageview(path?: string, _?: string[], title?: string) {
    ReactGA.pageview(path, _, title)
  }

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
