import ReactGA from 'react-ga4'

import { ErrorInfo } from 'react'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

export * from './listEvents'
export * from './settingsEvents'
export * from './themeEvents'
export * from './transactionEvents'
export * from './walletEvents'
export * from './swapEvents'
export * from './otherEvents'

export const GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY = 'ga_client_id'
export const ANALITICS_EVENTS = {}

export interface EventParams {
  category: Category
  action: string
  label?: string
  value?: number
}

export enum Category {
  SWAP = 'Swap',
  LIST = 'Lists',
  CURRENCY_SELECT = 'Currency Select',
  EXPERT_MODE = 'Expert mode',
  RECIPIENT_ADDRESS = 'Recipient address',
  ORDER_SLIPAGE_TOLERANCE = 'Order Slippage Tolerance',
  ORDER_EXPIRATION_TIME = 'Order Expiration Time',
  WALLET = 'Wallet',
  WRAP_NATIVE_TOKEN = 'Wrapped Native Token',
  CLAIM_COW_FOR_LOCKED_GNO = 'Claim COW for Locked GNO', // TODO: Maybe Claim COW was enough?
  THEME = 'Theme',
  GAMES = 'Games',
  EXTERNAL_LINK = 'External Link',
}

export function persistClientId() {
  // typed as 'any' in react-ga4 -.-
  ReactGA.ga((tracker: any) => {
    if (!tracker) return

    const clientId = tracker.get('clientId')
    window.localStorage.setItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY, clientId)
  })
}

function sendWebVitals({ name, delta, id }: Metric) {
  ReactGA._gaCommandSendTiming('Web Vitals', name, Math.round(name === 'CLS' ? delta * 1000 : delta), id)
}

export function reportWebVitals() {
  getFCP(sendWebVitals)
  getFID(sendWebVitals)
  getLCP(sendWebVitals)
  getCLS(sendWebVitals)
}

export function onChainIdChange(chainId: number | undefined) {
  // chainId - custom dimension 1
  ReactGA.set({ chainId: chainId ?? 0 })
}

export function onWalletChange(walletName: string | undefined) {
  // walletname - custom dimension 2
  ReactGA.set({ walletName })
}

export function onPathNameChange(pathname: string, search: string) {
  ReactGA.send({ hitType: 'pageview', page: `${pathname}${search}` })
}

export function reportError(error: Error, errorInfo: ErrorInfo) {
  ReactGA.event('exception', { description: error.toString() + errorInfo.toString(), fatal: true })
}

export function reportEvent(params: EventParams) {
  ReactGA.event(params)
}
