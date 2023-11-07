import { sendEvent, Category } from '@cowprotocol/analytics'

export function connectWalletToConfigurator() {
  sendEvent({
    category: Category.WIDGET_CONFIGURATOR,
    action: 'Connect wallet',
  })
}

export function viewEmbedCode() {
  sendEvent({
    category: Category.WIDGET_CONFIGURATOR,
    action: 'View code',
  })
}

export function copyEmbedCode() {
  sendEvent({
    category: Category.WIDGET_CONFIGURATOR,
    action: 'Copy code',
  })
}
