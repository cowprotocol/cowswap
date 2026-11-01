import type { SolanaQuoteCosts } from '@cowprotocol/cow-sdk'

import { positiveIntegerAtom } from './positiveIntegerAtom'

export interface SolanaCostAtoms {
  networkFeeAtoms: bigint
  accountRentAtoms: bigint
  total: bigint
}

/**
 * The costs a Solana quote netted out of its amounts, in atoms of `costs.token`.
 *
 * `total` is summed rather than read off `costs.total`, which also carries `costs.protocolFee`: a
 * protocol fee reaches the amounts through `protocolFeeBps` on its own, so taking the reported total
 * would count it twice.
 */
export function getSolanaCostAtoms(costs: SolanaQuoteCosts): SolanaCostAtoms {
  const networkFeeAtoms = positiveIntegerAtom(costs.networkFees) ?? 0n
  const accountRentAtoms = positiveIntegerAtom(costs.buyTokenAtaCosts) ?? 0n

  return { networkFeeAtoms, accountRentAtoms, total: networkFeeAtoms + accountRentAtoms }
}
