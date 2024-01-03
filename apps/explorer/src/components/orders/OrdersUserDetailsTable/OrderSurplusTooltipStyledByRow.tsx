import React from 'react'

import { Order } from 'api/operator'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'
import { OrderSurplusTooltipDisplay } from '../OrderSurplusDisplay'

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  order: Order
}

/**
 * Displays surplus amount inside tooltip when display mode has little space to display
 */
export function OrderSurplusDisplayStyledByRow({ order }: Props): JSX.Element {
  const isDesktop = useMediaBreakpoint(['xl', 'lg'])
  const showAmountBesideSurplus = !isDesktop
  const defaultWhenNoSurplus = '-'

  return (
    <OrderSurplusTooltipDisplay
      order={order}
      amountSmartFormatting
      showHiddenSection={showAmountBesideSurplus}
      defaultWhenNoSurplus={defaultWhenNoSurplus}
      strechWhenNoSurplus
    />
  )
}
