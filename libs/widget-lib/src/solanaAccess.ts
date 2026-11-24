import type { CowSwapWidgetParams } from './types'

/**
 * Resolves the partner's opt-in into the single answer both sides of the iframe use: the
 * `solanaEnabled` URL flag the wallet config reads at boot, and the network list the widget
 * renders once the params arrive.
 *
 * @param hasSolanaProvider Whether the host passed a {@link CowSwapWidgetProps.solanaProvider}.
 *   Only consulted in dapp mode, where the widget has no wallet of its own: without a host wallet
 *   to sign with, Solana would be selectable and then dead, so it stays hidden.
 */
export function isSolanaEnabledForWidget(
  params: Partial<CowSwapWidgetParams>,
  hasSolanaProvider: boolean = false,
): boolean {
  const { enableSolana, standaloneMode } = params

  if (!enableSolana) return false

  return standaloneMode !== false || hasSolanaProvider
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
