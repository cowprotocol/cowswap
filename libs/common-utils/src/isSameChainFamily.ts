import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Whether two chains belong to the same wallet family (EVM ↔ EVM, or the exact same non-EVM chain).
 *
 * EVM and non-EVM networks use different wallets, so switching across the family
 * boundary requires disconnecting and connecting a compatible wallet rather than
 * a plain network switch.
 */
export function isSameChainFamily(a: SupportedChainId, b: SupportedChainId): boolean {
  if (isEvmChain(a) && isEvmChain(b)) return true

  // Non-EVM families are distinct from EVM and from each other (e.g. Solana vs Bitcoin),
  // so they only match when it is literally the same chain.
  return a === b
}
