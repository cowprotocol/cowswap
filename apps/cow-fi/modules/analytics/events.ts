import { initCowAnalyticsGoogle } from '@cowprotocol/analytics'

export const cowAnalytics = initCowAnalyticsGoogle()

export enum Category {
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
}

export const WidgetEvents = {
  CONFIGURE_WIDGET: { category: Category.WIDGET, action: 'Configure Widget' },
  READ_DOCS: { category: Category.WIDGET, action: 'Read Docs' },
  READ_TERMS: { category: Category.WIDGET, action: 'Read Terms and Conditions' },
  TALK_TO_US: { category: Category.WIDGET, action: 'Talk To Us' },
}

export function clickOnToken(name: string) {
  cowAnalytics.sendEvent({
    category: Category.TOKENS,
    action: `click-token-${name}`,
  })
}

export function clickOnCowAmm(event: string) {
  cowAnalytics.sendEvent({
    category: Category.COWAMM,
    action: event,
  })
}

export function clickOnCowProtocol(event: string) {
  cowAnalytics.sendEvent({
    category: Category.COWPROTOCOL,
    action: event,
  })
}

export function clickOnCowSwap(event: string) {
  cowAnalytics.sendEvent({
    category: Category.COWSWAP,
    action: event,
  })
}

export function clickOnMevBlocker(event: string) {
  cowAnalytics.sendEvent({
    category: Category.MEVBLOCKER,
    action: event,
  })
}

export function clickOnError404GoHome() {
  cowAnalytics.sendEvent({
    category: Category.ERROR404,
    action: 'click-homepage',
  })
}

export function clickOnDaos(event: string) {
  cowAnalytics.sendEvent({
    category: Category.DAOS,
    action: event,
  })
}

export function clickOnHome(event: string) {
  cowAnalytics.sendEvent({
    category: Category.HOME,
    action: event,
  })
}

export function clickOnWidget(event: string) {
  cowAnalytics.sendEvent({
    category: Category.HOME,
    action: event,
  })
}

export function clickOnCareers(event: string) {
  cowAnalytics.sendEvent({
    category: Category.CAREERS,
    action: event,
  })
}

export function clickOnKnowledgeBase(event: string) {
  cowAnalytics.sendEvent({
    category: Category.KNOWLEDGEBASE,
    action: event,
  })
}

export function clickOnLegal(event: string) {
  cowAnalytics.sendEvent({
    category: Category.LEGAL,
    action: event,
  })
}
