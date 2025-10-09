import { ReactNode, useMemo } from 'react'

import { bpsToPercent, formatPercent } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import { useIsEoaEthFlow } from 'modules/trade'
import { useSmartSlippageFromQuote } from 'modules/tradeQuote'
import { useIsDefaultSlippageApplied, useIsSmartSlippageApplied, useSetSlippage } from 'modules/tradeSlippage'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { RowSlippageContent } from '../../pure/Row/RowSlippageContent'

export interface RowSlippageProps {
  allowedSlippage: Percent
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
  isSlippageModified: boolean
  isTradePriceUpdating: boolean
  hideRecommendedSlippage?: boolean
}

export function RowSlippage({
  allowedSlippage,
  slippageTooltip,
  slippageLabel,
  isTradePriceUpdating,
  isSlippageModified,
  hideRecommendedSlippage,
}: RowSlippageProps): ReactNode {
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()
  const smartSlippageFromQuote = useSmartSlippageFromQuote()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const isDefaultSlippageApplied = useIsDefaultSlippageApplied()
  const setSlippage = useSetSlippage()

  const formattedSmartSlippage = smartSlippageFromQuote
    ? `${formatPercent(bpsToPercent(smartSlippageFromQuote))}%`
    : undefined

  const props = useMemo(
    () => ({
      isEoaEthFlow,
      symbols: [nativeCurrency.symbol],
      allowedSlippage,
      slippageLabel,
      slippageTooltip,
      displaySlippage: `${formatPercent(allowedSlippage)}%`,
      isSmartSlippageApplied,
      isDefaultSlippageApplied,
      isSmartSlippageLoading: isTradePriceUpdating,
      smartSlippage: formattedSmartSlippage,
      setAutoSlippage: smartSlippageFromQuote ? () => setSlippage(null) : undefined,
    }),
    [
      isEoaEthFlow,
      nativeCurrency.symbol,
      allowedSlippage,
      slippageLabel,
      slippageTooltip,
      smartSlippageFromQuote,
      formattedSmartSlippage,
      isDefaultSlippageApplied,
      isSmartSlippageApplied,
      isTradePriceUpdating,
      setSlippage,
    ],
  )

  return (
    <RowSlippageContent
      {...props}
      isSlippageModified={isSlippageModified}
      hideRecommendedSlippage={hideRecommendedSlippage}
    />
  )
}
