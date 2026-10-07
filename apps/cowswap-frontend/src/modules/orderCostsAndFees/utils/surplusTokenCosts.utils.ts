import { AddressKey, areAddressesEqual } from '@cowprotocol/cow-sdk'

import BigNumber from 'bignumber.js'

import { CostLineItem, SurplusTokenCost, SurplusTokenCosts } from '../types/orderCostsAndFees.types'

export interface SurplusConversionContext {
  surplusKey: AddressKey
  otherKey: AddressKey
  nativeKey: AddressKey
  wrappedNativeKey: AddressKey
  isSell: boolean
  executedSellAmount: bigint
  executedBuyAmount: bigint
  /** Native atoms (wei) per atom of the surplus token. */
  surplusNativePrice: number | null
}

/** `null` when any item can't be converted: the caller then shows the per-token amounts instead. */
export function toSurplusTokenCosts(
  lineItems: CostLineItem[],
  context: SurplusConversionContext,
): SurplusTokenCosts | null {
  const items: SurplusTokenCost[] = []

  for (const item of lineItems) {
    const converted = convertItem(item, context)
    if (!converted) return null
    items.push(converted)
  }

  return {
    items,
    total: items.reduce((sum, { amount }) => sum + amount, 0n),
    isApproximate: items.some(({ isApproximate }) => isApproximate),
  }
}

function convertItem(
  { tokenAddress, amount }: CostLineItem,
  context: SurplusConversionContext,
): SurplusTokenCost | null {
  const { surplusKey, otherKey, nativeKey, wrappedNativeKey, isSell, executedSellAmount, executedBuyAmount } = context

  if (areAddressesEqual(tokenAddress, surplusKey)) return { amount, isApproximate: false }

  if (areAddressesEqual(tokenAddress, otherKey)) {
    const [surplusAmount, otherAmount] = isSell
      ? [executedBuyAmount, executedSellAmount]
      : [executedSellAmount, executedBuyAmount]
    if (otherAmount === 0n) return null

    return { amount: (amount * surplusAmount) / otherAmount, isApproximate: false }
  }

  if (!areAddressesEqual(tokenAddress, nativeKey)) return null
  if (areAddressesEqual(surplusKey, wrappedNativeKey)) return { amount, isApproximate: false }

  const price = context.surplusNativePrice
  if (price === null || !Number.isFinite(price) || price <= 0) return null

  // wei / (wei per surplus atom) = surplus atoms
  const converted = new BigNumber(amount.toString()).div(price).integerValue(BigNumber.ROUND_HALF_UP)

  return { amount: BigInt(converted.toFixed()), isApproximate: true }
}
