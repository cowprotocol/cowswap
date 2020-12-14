import { BigNumber } from 'ethers'
import { FeeInformation } from './operator'

const BPS_BASE = 10_000 // The number of basis points to make up 100%.

export interface GetFeeAmount extends Omit<FeeInformation, 'expirationDate'> {
  sellAmount: string
}

export function getFeeAmount(params: GetFeeAmount): string {
  const amountBn = BigNumber.from(params.sellAmount)
  const feeForAmount = amountBn.mul(params.feeRatio).div(BPS_BASE)

  if (feeForAmount.lt(params.minimalFee)) {
    return params.minimalFee
  } else {
    return feeForAmount.toString()
  }
}
