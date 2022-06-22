import ReactGA from 'react-ga4'
import { ErrorInfo } from 'react'
import { EventParams } from './types'

export function onChainIdChange(chainId: number | undefined) {
  // cd1 - custom dimension 1 - chainId
  ReactGA.set({ cd1: chainId ?? 0 })
}

export function onPathNameChange(pathname: string, search: string) {
  ReactGA.send({ hitType: 'pageview', page: `${pathname}${search}` })
}

export function reportError(error: Error, errorInfo: ErrorInfo) {
  ReactGA.event('exception', { description: error.toString() + errorInfo.toString(), fatal: true })
}

export function _reportEvent(params: EventParams) {
  ReactGA.event(params)
}
