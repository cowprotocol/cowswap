import { ErrorInfo } from 'react'

import { UaEventOptions } from 'react-ga4/types/ga4'

import { GAProvider } from './provider'

export enum EventCategories {
  HOME = 'Homepage',
  NAVIGATION = 'Navigation',
  WIDGET = 'Widget',
  COWAMM = 'CoW AMM',
  COWSWAP = 'CoW Swap',
  COWPROTOCOL = 'CoW Protocol',
  MEVBLOCKER = 'MEV Blocker',
  DAOS = 'DAOs',
  KNOWLEDGEBASE = 'Knowledge Base',
  ERROR404 = 'Error 404',
  CAREERS = 'Careers',
  TOKENS = 'Tokens',
  LEGAL = 'Legal',
  FOOTER = 'Footer',
}

export const WidgetEvents = {
  CONFIGURE_WIDGET: { category: EventCategories.WIDGET, action: 'Configure Widget' },
  READ_DOCS: { category: EventCategories.WIDGET, action: 'Read Docs' },
  READ_TERMS: { category: EventCategories.WIDGET, action: 'Read Terms and Conditions' },
  TALK_TO_US: { category: EventCategories.WIDGET, action: 'Talk To Us' },
}

export const googleAnalytics = new GAProvider()

export function sendEvent(event: string | UaEventOptions, params?: any) {
  return googleAnalytics.sendEvent(event, params)
}

export function sendError(error: Error, errorInfo: ErrorInfo) {
  return googleAnalytics.sendError(error, errorInfo)
}

export function sendEventHandler(event: string | UaEventOptions, params?: any) {
  return () => sendEvent(event, params)
}
