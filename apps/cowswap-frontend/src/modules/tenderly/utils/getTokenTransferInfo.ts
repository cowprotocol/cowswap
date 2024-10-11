import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { TokenBuyTransferInfo } from './bundleSimulation'

import { TokenHolder } from '../types'

export function getTokenTransferInfo({
  tokenHolders,
  amountToTransfer,
}: {
  tokenHolders: TokenHolder[]
  amountToTransfer: CurrencyAmount<Currency>
}): TokenBuyTransferInfo {
  let sum = CurrencyAmount.fromRawAmount(amountToTransfer.currency, '0')
  const result: TokenBuyTransferInfo = []

  if (!tokenHolders) {
    return result
  }

  for (const tokenHolder of tokenHolders) {
    // skip token holders with no address or balance
    if (!tokenHolder.address || !tokenHolder.balance) continue

    const tokenHolderAmount = CurrencyAmount.fromRawAmount(amountToTransfer.currency, tokenHolder.balance)
    const sumWithTokenHolder = sum.add(tokenHolderAmount)

    if (sumWithTokenHolder.greaterThan(amountToTransfer) || sumWithTokenHolder.equalTo(amountToTransfer)) {
      const remainingAmount = amountToTransfer.subtract(sum)
      result.push({
        sender: tokenHolder.address,
        amount: remainingAmount,
      })
      break
    }
    sum = sum.add(tokenHolderAmount)
    result.push({
      sender: tokenHolder.address,
      amount: tokenHolderAmount,
    })
  }

  return result
}
