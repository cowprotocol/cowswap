import { ErrorInfo } from 'react'

import { UaEventOptions } from 'react-ga4/types/ga4'

import { GAProvider } from './provider'

export const googleAnalytics = new GAProvider()

export function sendEvent(event: string | UaEventOptions, params?: any) {
  return googleAnalytics.sendEvent(event, params)
}

export function sendError(error: Error, errorInfo: ErrorInfo) {
  return googleAnalytics.sendError(error, errorInfo)
}
