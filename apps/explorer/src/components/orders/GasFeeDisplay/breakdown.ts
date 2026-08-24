import { AddressKey, getAddressKey } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from 'const'

import { ProtocolFee, ProtocolFeeOwner, ProtocolFeeType } from 'api/operator'

/**
 * The protocol's own fees. Both ways of charging on price improvement read as the DAO's share of
 * it; the policy that computed it is an implementation detail the user doesn't need.
 */
const PROTOCOL_FEE_LABELS: Record<ProtocolFeeType, string> = {
  [ProtocolFeeType.Surplus]: 'DAO price improvement share',
  [ProtocolFeeType.PriceImprovement]: 'DAO price improvement share',
  [ProtocolFeeType.Volume]: 'Protocol fee',
  [ProtocolFeeType.Unknown]: 'Protocol fee',
}

/** A partner's fees, appended to its number. Partners are numbered but never named. */
const PARTNER_FEE_LABELS: Record<ProtocolFeeType, string> = {
  [ProtocolFeeType.Surplus]: 'surplus fee',
  [ProtocolFeeType.PriceImprovement]: 'price improvement share',
  [ProtocolFeeType.Volume]: 'volume fee',
  [ProtocolFeeType.Unknown]: 'fee',
}

export type LineItem = { label: string; tokenAddress: AddressKey; amount: BigNumber }

/**
 * One row per cost: network costs first, then the fees in the order they were applied.
 *
 * The labels already tell the protocol's fees from each partner's. A label that still repeats — one
 * partner charging the same kind of fee twice — gets a counter so the rows stay distinguishable.
 */
export function buildLineItems(protocolFees: ProtocolFee[], gasCost: BigNumber, nativeKey: AddressKey): LineItem[] {
  const labels = protocolFees.map(getFeeLabel)
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

export function getFeeLabel({ owner, type, partnerNumber }: ProtocolFee): string {
  return owner === ProtocolFeeOwner.Partner
    ? `Partner ${partnerNumber ?? 1} ${PARTNER_FEE_LABELS[type]}`
    : PROTOCOL_FEE_LABELS[type]
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
