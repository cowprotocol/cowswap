import { Fraction, Rounding } from '@uniswap/sdk-core'

import { HIGH_TIER_FEE, LOW_TIER_FEE, MEDIUM_TIER_FEE } from './consts'

type FeePercentage = typeof HIGH_TIER_FEE | typeof MEDIUM_TIER_FEE | typeof LOW_TIER_FEE | undefined

// checks fee as percentage (30% not a decimal)
export function _getWarningInfo(feePercentage?: Fraction): FeePercentage {
  if (!feePercentage || feePercentage.lessThan(LOW_TIER_FEE)) {
    return undefined
  } else if (feePercentage.lessThan(MEDIUM_TIER_FEE)) {
    return LOW_TIER_FEE
  } else if (feePercentage.lessThan(HIGH_TIER_FEE)) {
    return MEDIUM_TIER_FEE
  } else {
    return HIGH_TIER_FEE
  }
}

const formatFeePercentage = (feePercentage: Fraction | undefined): string => {
  return feePercentage?.toSignificant(2, undefined, Rounding.ROUND_DOWN) ?? '0'
}

export const getHighFeeWarningMessageContent = ({
  isHighFee,
  isHighBridgeFee,
  feePercentage,
  bridgeFeePercentage,
}: {
  isHighFee: boolean
  isHighBridgeFee?: boolean
  feePercentage?: Fraction
  bridgeFeePercentage?: Fraction
}): string | null => {
  if (isHighFee && isHighBridgeFee) {
    return feePercentage === bridgeFeePercentage
      ? `Swap and bridge costs are at least ${formatFeePercentage(feePercentage)}% of the swap amount`
      : `Swap costs are at least ${formatFeePercentage(feePercentage)}% of the swap amount and bridge costs are at least ${formatFeePercentage(bridgeFeePercentage)}% of the swap amount`
  }

  if (isHighFee) {
    return `Swap costs are at least ${formatFeePercentage(feePercentage)}% of the swap amount`
  }

  if (isHighBridgeFee) {
    return `Bridge costs are at least ${formatFeePercentage(bridgeFeePercentage)}% of the swap amount`
  }

  return null
}
