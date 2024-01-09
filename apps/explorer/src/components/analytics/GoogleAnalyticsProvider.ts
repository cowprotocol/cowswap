/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactGA from 'react-ga4'
import { GaOptions, InitOptions, UaEventOptions } from 'react-ga4/types/ga4'

/**
 * Google Analytics Provider containing all methods used throughout app to log events to Google Analytics.
 */
export default class GoogleAnalyticsProvider {
  public sendEvent(event: string | UaEventOptions, params?: any): void {
    ReactGA.event(event, params)
  }

  public initialize(
    GA_MEASUREMENT_ID: InitOptions[] | string,
    options?: {
      legacyDimensionMetric?: boolean
      nonce?: string
      testMode?: boolean
      gaOptions?: GaOptions | any
      gtagOptions?: any
    },
  ): void {
    ReactGA.initialize(GA_MEASUREMENT_ID, options)
  }

  public set(fieldsObject: any): void {
    ReactGA.set(fieldsObject)
  }

  public outboundLink(
    {
      label,
    }: {
      label: string
    },
    hitCallback: () => unknown,
  ): void {
    ReactGA.outboundLink({ label }, hitCallback)
  }

  public pageview(path?: string, _?: string[], title?: string): void {
    ReactGA.pageview(path, _, title)
  }

  public ga(...args: any[]): void {
    ReactGA.ga(...args)
  }

  public gaCommandSendTiming(timingCategory: any, timingVar: any, timingValue: any, timingLabel: any): void {
    ReactGA._gaCommandSendTiming(timingCategory, timingVar, timingValue, timingLabel)
  }
}
