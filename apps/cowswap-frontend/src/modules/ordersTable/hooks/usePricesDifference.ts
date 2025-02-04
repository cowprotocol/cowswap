import { Currency, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { calculatePriceDifference, PriceDifference } from 'utils/orderUtils/calculatePriceDifference'

import { OrderRowProps } from '../containers/OrderRow'

/**
 * Helper hook to prepare the parameters to calculate price difference
 */
export function usePricesDifference(
  estimatedExecutionPrice: Nullish<Price<Currency, Currency>>,
  spotPrice: OrderRowProps['spotPrice'],
  isInverted: boolean,
): PriceDifference {
  return useSafeMemo(
    () =>
      calculatePriceDifference({
        referencePrice: spotPrice,
        targetPrice: estimatedExecutionPrice,
        isInverted,
      }),
    [estimatedExecutionPrice, spotPrice, isInverted],
  )
}
