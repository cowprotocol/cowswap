import { JSX, useMemo } from 'react'

import { formatPercent } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import { useIsEoaEthFlow } from 'modules/trade'
import { useSmartSlippageFromQuote } from 'modules/tradeQuote'
import { useIsSmartSlippageApplied, useSetSlippage } from 'modules/tradeSlippage'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useIsDefaultSlippageApplied } from '../../../tradeSlippage/hooks/useIsDefaultSlippageApplied'
import { RowSlippageContent } from '../../pure/Row/RowSlippageContent'

export interface RowSlippageProps {
  allowedSlippage: Percent
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
  isSlippageModified: boolean
  isTradePriceUpdating: boolean
}

export function RowSlippage({
  allowedSlippage,
  slippageTooltip,
  slippageLabel,
  isTradePriceUpdating,
  isSlippageModified,
}: RowSlippageProps): JSX.Element {
  const { chainId } = useWalletInfo()

  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()
  const smartSlippage = useSmartSlippageFromQuote()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const isDefaultSlippageApplied = useIsDefaultSlippageApplied()
  const setSlippage = useSetSlippage()

  const props = useMemo(
    () => ({
      chainId,
      isEoaEthFlow,
      symbols: [nativeCurrency.symbol],
      allowedSlippage,
      slippageLabel,
      slippageTooltip,
      displaySlippage: `${formatPercent(allowedSlippage)}%`,
      isSmartSlippageApplied,
      isDefaultSlippageApplied,
      isSmartSlippageLoading: isTradePriceUpdating,
      smartSlippage:
        smartSlippage ? `${formatPercent(new Percent(smartSlippage, 10_000))}%` : undefined,
      setAutoSlippage: smartSlippage ? () => setSlippage(null) : undefined,
    }),
    [
      chainId,
      isEoaEthFlow,
      nativeCurrency.symbol,
      allowedSlippage,
      slippageLabel,
      slippageTooltip,
      smartSlippage,
      isDefaultSlippageApplied,
      isSmartSlippageApplied,
      isTradePriceUpdating,
      setSlippage,
    ],
  )

  return <RowSlippageContent {...props} isSlippageModified={isSlippageModified} />
}
