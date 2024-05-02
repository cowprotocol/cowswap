import ReactGA from 'react-ga4'
import type { UaEventOptions } from 'react-ga4/types/ga4'

export function sendGAEvent(event: string | UaEventOptions, params?: any) {
  ReactGA.event(event, params || {})
}

export function sendGAEventHandler(event: string | UaEventOptions, params?: any) {
  return () => sendGAEvent(event, params)
}
