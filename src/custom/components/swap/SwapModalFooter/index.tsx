import React from 'react'
import { computeTradePriceBreakdown, FEE_TOOLTIP_MSG } from '../TradeSummary'
import SwapModalFooterMod, { SwapModalFooterProps } from './SwapModalFooterMod'

export default function SwapModalFooter(props: Omit<SwapModalFooterProps, 'fee' | 'priceImpactWithoutFee'>) {
  const { /*priceImpactWithoutFee,*/ realizedFee } = React.useMemo(() => computeTradePriceBreakdown(props.trade), [
    props.trade
  ])

  return (
    <SwapModalFooterMod
      {...props}
      fee={{
        feeTitle: 'Fee',
        feeAmount: realizedFee,
        feeTooltip: FEE_TOOLTIP_MSG
      }}
      // priceImpactWithoutFee={priceImpactWithoutFee}
    />
  )
}
