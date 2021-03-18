import { BigNumber } from 'ethers'
import { FeeInformation } from './operator'

const BPS_BASE = 10_000 // The number of basis points to make up 100%.

export interface GetFeeAmount extends Omit<FeeInformation, 'expirationDate'> {
  sellAmount: string
}

export function getFeeAmount(params: GetFeeAmount): string {
  const { feeRatio, minimalFee, sellAmount } = params

  const amountBn = BigNumber.from(sellAmount)
  const feeForAmount = amountBn.mul(feeRatio).div(BPS_BASE)

  return feeForAmount.lt(minimalFee) ? minimalFee : feeForAmount.toString()
}
