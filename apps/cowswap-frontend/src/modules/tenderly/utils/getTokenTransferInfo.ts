import { BigNumber } from 'ethers'

import { TokenBuyTransferInfo } from './bundleSimulation'

import { TokenHolder } from '../types'

export function getTokenTransferInfo({
  tokenHolders,
  amountToTransfer,
}: {
  tokenHolders: TokenHolder[]
  amountToTransfer: string
}): TokenBuyTransferInfo {
  const amountToTransferBigNumber = BigNumber.from(amountToTransfer)
  let sum = BigNumber.from('0')
  const result: TokenBuyTransferInfo = []

  if (!tokenHolders) {
    return result
  }

  for (const tokenHolder of tokenHolders) {
    // skip token holders with no address or balance
    if (!tokenHolder.address || !tokenHolder.balance) continue

    const tokenHolderAmount = BigNumber.from(tokenHolder.balance)
    const sumWithTokenHolder = sum.add(tokenHolderAmount)

    if (sumWithTokenHolder.gte(amountToTransferBigNumber)) {
      const remainingAmount = amountToTransferBigNumber.sub(sum)
      result.push({
        sender: tokenHolder.address,
        amount: remainingAmount.toString(),
      })
      break
    }
    sum = sum.add(tokenHolderAmount)
    result.push({
      sender: tokenHolder.address,
      amount: tokenHolderAmount.toString(),
    })
  }

  return result
}
