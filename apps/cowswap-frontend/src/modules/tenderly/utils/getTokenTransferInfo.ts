import { TokenBuyTransferInfo } from './bundleSimulation'

import { TokenHolder } from '../types'

export function getTokenTransferInfo({
  tokenHolders,
  amountToTransfer,
}: {
  tokenHolders: TokenHolder[]
  amountToTransfer: string
}): TokenBuyTransferInfo {
  const amountToTransferBigNumber = BigInt(amountToTransfer)
  let sum = 0n
  const result: TokenBuyTransferInfo = []

  if (!tokenHolders) {
    return result
  }

  for (const tokenHolder of tokenHolders) {
    // skip token holders with no address or balance
    if (!tokenHolder.address || !tokenHolder.balance) continue

    const tokenHolderAmount = BigInt(tokenHolder.balance)
    const sumWithTokenHolder = sum + tokenHolderAmount

    if (sumWithTokenHolder >= amountToTransferBigNumber) {
      const remainingAmount = amountToTransferBigNumber - sum
      result.push({
        sender: tokenHolder.address,
        amount: remainingAmount.toString(),
      })
      break
    }
    sum = sum + tokenHolderAmount
    result.push({
      sender: tokenHolder.address,
      amount: tokenHolderAmount.toString(),
    })
  }

  return result
}
