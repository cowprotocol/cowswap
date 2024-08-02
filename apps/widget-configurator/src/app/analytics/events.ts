import { initCowAnalyticsGoogle } from '@cowprotocol/analytics'

export const cowAnalytics = initCowAnalyticsGoogle()

enum Category {
  WIDGET_CONFIGURATOR = 'Widget configurator',
}

export function connectWalletToConfiguratorGA() {
  cowAnalytics.sendEvent({
    category: Category.WIDGET_CONFIGURATOR,
    action: 'Connect wallet',
  })
}

export function viewEmbedCodeGA() {
  cowAnalytics.sendEvent({
    category: Category.WIDGET_CONFIGURATOR,
    action: 'View code',
  })
}

export function copyEmbedCodeGA() {
  cowAnalytics.sendEvent({
    category: Category.WIDGET_CONFIGURATOR,
    action: 'Copy code',
  })
}
