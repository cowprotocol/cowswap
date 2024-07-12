import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { Order } from 'api/operator'

import { OrderSurplusTooltipDisplay } from '../OrderSurplusDisplay'

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  order: Order
}

/**
 * Displays surplus amount inside tooltip when display mode has little space to display
 */
export function OrderSurplusDisplayStyledByRow({ order }: Props): React.ReactNode {
  const isDesktop = useMediaQuery(Media.LargeAndUp(false))
  const showAmountBesideSurplus = !isDesktop
  const defaultWhenNoSurplus = '-'

  return (
    <OrderSurplusTooltipDisplay
      order={order}
      amountSmartFormatting
      showHiddenSection={showAmountBesideSurplus}
      defaultWhenNoSurplus={defaultWhenNoSurplus}
    />
  )
}
