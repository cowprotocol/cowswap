import type { MessageDescriptor } from '@lingui/core'

import type { AddressKey } from '@cowprotocol/cow-sdk'

import { msg } from '@lingui/core/macro'

import { CostLineItem, ProtocolFee, ProtocolFeeOwner, ProtocolFeeType } from '../types/orderCostsAndFees.types'

/** Network costs first, then the fees in the order they were applied. */
export function buildCostLineItems(
  protocolFees: ProtocolFee[],
  gasCost: bigint,
  nativeKey: AddressKey,
): CostLineItem[] {
  const feeItems = protocolFees.map((fee) => ({
    label: getFeeLabel(fee),
    tokenAddress: fee.tokenAddress,
    amount: fee.amount,
  }))

  return [{ label: msg`Network costs`, tokenAddress: nativeKey, amount: gasCost }, ...numberRepeatedLabels(feeItems)]
}

/** One total per token, in first-seen order. Wrapped native deliberately stays separate from native. */
export function sumByToken(items: CostLineItem[]): Array<[AddressKey, bigint]> {
  const byToken = new Map<AddressKey, bigint>()

  for (const { tokenAddress, amount } of items) {
    byToken.set(tokenAddress, (byToken.get(tokenAddress) ?? 0n) + amount)
  }

  return Array.from(byToken)
}

function getFeeLabel({ owner, type, partnerNumber = 1 }: ProtocolFee): MessageDescriptor {
  if (owner === ProtocolFeeOwner.Protocol) {
    return type === ProtocolFeeType.Surplus || type === ProtocolFeeType.PriceImprovement
      ? msg`DAO price improvement share`
      : msg`Protocol fee`
  }

  switch (type) {
    case ProtocolFeeType.Volume:
      return msg`Partner ${partnerNumber} volume fee`
    case ProtocolFeeType.PriceImprovement:
      return msg`Partner ${partnerNumber} price improvement share`
    case ProtocolFeeType.Surplus:
      return msg`Partner ${partnerNumber} surplus fee`
    default:
      return msg`Partner ${partnerNumber} fee`
  }
}

function numberRepeatedLabels(items: CostLineItem[]): CostLineItem[] {
  const keys = items.map(({ label }) => `${label.id}:${JSON.stringify(label.values ?? {})}`)
  const occurrences = new Map<string, number>()
  const seen = new Map<string, number>()

  for (const key of keys) occurrences.set(key, (occurrences.get(key) ?? 0) + 1)

  return items.map((item, index) => {
    const key = keys[index]
    if (occurrences.get(key) === 1) return item

    const occurrence = (seen.get(key) ?? 0) + 1
    seen.set(key, occurrence)

    return { ...item, occurrence }
  })
}
