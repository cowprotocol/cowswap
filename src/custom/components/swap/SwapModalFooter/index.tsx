import React from 'react'
import { computeTradePriceBreakdown } from '../TradeSummary'
import SwapModalFooterMod, { SwapModalFooterProps } from './SwapModalFooterMod'

export default function SwapModalFooter(props: Omit<SwapModalFooterProps, 'fee' | 'priceImpactWithoutFee'>) {
  const { priceImpactWithoutFee, realizedFee } = React.useMemo(() => computeTradePriceBreakdown(props.trade), [
    props.trade
  ])

  return (
    <SwapModalFooterMod
      {...props}
      fee={{
        feeTitle: 'Fee',
        feeAmount: realizedFee,
        feeTooltip: 'Cow Swap has 0 gas costs. A portion of the sell amount in each trade goes to the Protocol.'
      }}
      priceImpactWithoutFee={priceImpactWithoutFee}
    />
  )
}
