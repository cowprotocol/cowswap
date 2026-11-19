import type { CowSwapWidgetParams } from './types'

/**
 * Resolves the partner's opt-in into the single answer both sides of the iframe use: the
 * `solanaEnabled` URL flag the wallet config reads at boot, and the network list the widget
 * renders once the params arrive.
 *
 * Solana trades are signed by the widget's own wallet, which dapp mode does not have — its
 * provider contract is EIP-1193. And a configured `partnerFee` keeps Solana off rather than
 * letting a partner serve trades that silently earn them nothing, since partner fees are not
 * charged on Solana yet.
 */
export function isSolanaEnabledForWidget(params: Partial<CowSwapWidgetParams>): boolean {
  const { enableSolana, partnerFee, standaloneMode } = params

  return Boolean(enableSolana) && !partnerFee && standaloneMode !== false
}
