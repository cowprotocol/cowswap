import { ErrorInfo } from 'react'

import ReactGA from 'react-ga4'

import {} from 'web-vitals'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

export const GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY = 'ga_client_id'
export const ANALITICS_EVENTS = {}

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
  // cd1 - custom dimension 1 - chainId
  ReactGA.set({ cd1: chainId ?? 0 })
}

export function onPathNameChange(pathname: string, search: string) {
  ReactGA.send({ hitType: 'pageview', page: `${pathname}${search}` })
}

export function reportError(error: Error, errorInfo: ErrorInfo) {
  ReactGA.event('exception', { description: error.toString() + errorInfo.toString(), fatal: true })
}

interface EventParams {
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
  ORDER_SLIPPAGE = 'Order Slippage Tolerance',
  WRAP_NATIVE_TOKEN = 'Wrapped Native Token',
  CLAIM_COW_FOR_LOCKED_GNO = 'Claim COW for Locked GNO', // TODO: Maybe Claim COW was enough?
}

function _reportEvent(params: EventParams) {
  ReactGA.event(params)
}

export function updateListAnalytics(listUrl: string, modal: boolean) {
  _reportEvent({
    category: Category.LIST,
    action: 'Update List from ' + modal ? 'Modal' : 'App',
    label: listUrl,
  })
}

export function toggleExpertModeAnalytics(isDisabling: boolean) {
  _reportEvent({
    category: Category.EXPERT_MODE,
    action: isDisabling ? 'Disable Expert Mode' : 'Enable Expert Mode',
  })
}

export function showExpertModeConfirmationAnalytics() {
  _reportEvent({
    category: Category.EXPERT_MODE,
    action: 'Show Confirmation',
  })
}

export function toggleRecepientAddressAnalytics(isDisabling: boolean) {
  _reportEvent({
    category: Category.RECIPIENT_ADDRESS,
    action: 'Toggle Recipient Address',
    label: !isDisabling ? 'Enabled' : 'Disabled',
  })
}
