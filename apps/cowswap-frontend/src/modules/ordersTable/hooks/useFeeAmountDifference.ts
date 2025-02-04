import { Percent } from '@uniswap/sdk-core'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { calculatePercentageInRelationToReference } from 'utils/orderUtils/calculatePercentageInRelationToReference'

import { OrderRowProps } from '../containers/OrderRow'

/**
 * Helper hook to calculate fee amount percentage
 */
export function useFeeAmountDifference(
  { inputCurrencyAmount }: OrderRowProps['orderParams']['rateInfoParams'],
  prices: OrderRowProps['prices'],
): Percent | undefined {
  const { feeAmount } = prices || {}

  return useSafeMemo(
    () => calculatePercentageInRelationToReference({ value: feeAmount, reference: inputCurrencyAmount }),
    [feeAmount, inputCurrencyAmount],
  )
}
