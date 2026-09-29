import { AddressKey, getAddressKey } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from 'const'

import { ProtocolFee, ProtocolFeeType } from 'api/operator'

// The API says how each fee was calculated but not who charged it, so labels name the policy.
export const FEE_TYPE_LABELS: Record<ProtocolFeeType, string> = {
  [ProtocolFeeType.Surplus]: 'Surplus fee',
  [ProtocolFeeType.Volume]: 'Volume fee',
  [ProtocolFeeType.PriceImprovement]: 'Price improvement fee',
  [ProtocolFeeType.Unknown]: 'Fee',
}

export type LineItem = { label: string; tokenAddress: AddressKey; amount: BigNumber }

/**
 * One row per cost: network costs first, then the fees in the order they were applied.
 * Repeated fee types get numbered so the rows stay distinguishable.
 */
export function buildLineItems(protocolFees: ProtocolFee[], gasCost: BigNumber, nativeKey: AddressKey): LineItem[] {
  const labels = protocolFees.map((fee) => FEE_TYPE_LABELS[fee.type])
  const occurrences = new Map<string, number>()
  const numbered = new Map<string, number>()

  for (const label of labels) occurrences.set(label, (occurrences.get(label) ?? 0) + 1)

  const feeItems = protocolFees.map(({ tokenAddress, amount }, index) => {
    const label = labels[index]
    const seen = (numbered.get(label) ?? 0) + 1
    numbered.set(label, seen)

    return { label: occurrences.get(label) === 1 ? label : `${label} (${seen})`, tokenAddress, amount }
  })

  return [{ label: 'Network costs', tokenAddress: nativeKey, amount: gasCost }, ...feeItems]
}

/** Indexes whatever token metadata is available so line items can be rendered with decimals. */
export function indexTokensByKey(tokens: Array<TokenErc20 | null | undefined>): Map<AddressKey, TokenErc20> {
  const map = new Map<AddressKey, TokenErc20>()

  for (const token of tokens) {
    if (token) map.set(getAddressKey(token.address), token)
  }

  return map
}

/** One total per token; wrapped native deliberately stays separate from native. */
export function sumByToken(lineItems: LineItem[]): Array<[AddressKey, BigNumber]> {
  const byToken = new Map<AddressKey, BigNumber>()

  for (const { tokenAddress, amount } of lineItems) {
    byToken.set(tokenAddress, (byToken.get(tokenAddress) ?? ZERO_BIG_NUMBER).plus(amount))
  }

  return Array.from(byToken)
}
