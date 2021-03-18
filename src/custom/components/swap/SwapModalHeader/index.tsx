import React from 'react'
import { computeTradePriceBreakdown } from '../TradeSummary'
import SwapModalHeaderMod, { SwapModalHeaderProps } from './SwapModalHeaderMod'

export default function SwapModalHeader(props: SwapModalHeaderProps) {
  const { priceImpactWithoutFee } = React.useMemo(() => computeTradePriceBreakdown(props.trade), [props.trade])
  return <SwapModalHeaderMod {...props} priceImpactWithoutFee={priceImpactWithoutFee} />
}
