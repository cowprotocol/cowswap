import { sendEvent, Category } from '@cowprotocol/analytics'

export function connectWalletToConfiguratorGA() {
  sendEvent({
    category: Category.WIDGET_CONFIGURATOR,
    action: 'Connect wallet',
  })
}

export function viewEmbedCodeGA() {
  sendEvent({
    category: Category.WIDGET_CONFIGURATOR,
    action: 'View code',
  })
}

export function copyEmbedCodeGA() {
  sendEvent({
    category: Category.WIDGET_CONFIGURATOR,
    action: 'Copy code',
  })
}
