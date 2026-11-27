import { WidgetSolanaProvider } from '@cowprotocol/iframe-transport'

import { registerWallet } from '@wallet-standard/wallet'

import { WidgetSolanaStandardWallet } from './WidgetSolanaStandardWallet'

let widgetSolanaWallet: WidgetSolanaStandardWallet | null = null

/**
 * Publishes the host dapp's Solana wallet into the widget's Wallet Standard registry.
 *
 * Deliberately called long after `createAppKit` built its adapters: whether the host owns the
 * wallet is only known once the widget params arrive. Reown keeps listening for registrations, so
 * the connector still appears — one connector-list change later, which is why
 * {@link connectWidgetSolanaWallet} waits for it rather than expecting it immediately.
 */
export function registerWidgetSolanaWallet(): WidgetSolanaStandardWallet {
  if (widgetSolanaWallet) return widgetSolanaWallet

  widgetSolanaWallet = new WidgetSolanaStandardWallet(new WidgetSolanaProvider())
  registerWallet(widgetSolanaWallet)

  return widgetSolanaWallet
}
