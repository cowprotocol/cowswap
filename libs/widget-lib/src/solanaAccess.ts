import type { CowSwapWidgetParams } from './types'

/**
 * Resolves the partner's opt-in into the single answer both sides of the iframe use: the
 * `solanaEnabled` URL flag the wallet config reads at boot, and the network list the widget
 * renders once the params arrive.
 *
 * Deliberately blind to whether a `solanaProvider` has arrived, which keeps Solana on the same
 * footing as the EVM chains: those are listed in dapp mode whether or not the host has lent a
 * wallet, and the connect screen handles the gap. Keying this on the provider instead would also
 * make the flag flip whenever the host's Solana wallet connects or disconnects, and a changed flag
 * costs an iframe reload (see `requiresIframeReload`) that drops the widget's other connection.
 */
export function isSolanaEnabledForWidget(params: Partial<CowSwapWidgetParams>): boolean {
  return !!params.enableSolana
}

/**
 * Reads back the flag {@link isSolanaEnabledForWidget} wrote into an iframe `src`.
 *
 * The Solana wallet adapters are built from that URL while the widget's bundle loads, so a later
 * `updateParams` cannot switch them on — the iframe has to be reloaded, and that decision needs the
 * value the running iframe was actually created with.
 */
export function isSolanaEnabledInWidgetSrc(src: string): boolean {
  const hashSearch = src.split('#')[1]?.split('?')[1]

  if (!hashSearch) return false

  return new URLSearchParams(hashSearch).get('solanaEnabled') === 'true'
}
