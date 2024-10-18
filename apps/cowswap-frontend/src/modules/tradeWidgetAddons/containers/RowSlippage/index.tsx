import { useMemo } from 'react'

import { formatPercent } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import { useIsEoaEthFlow } from 'modules/trade'
import { useIsSmartSlippageApplied, useSetSlippage, useSmartTradeSlippage } from 'modules/tradeSlippage'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

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
}: RowSlippageProps) {
  const { chainId } = useWalletInfo()

  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()
  const smartSlippage = useSmartTradeSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
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
      isSmartSlippageLoading: isTradePriceUpdating,
      smartSlippage:
        smartSlippage && !isEoaEthFlow ? `${formatPercent(new Percent(smartSlippage, 10_000))}%` : undefined,
      setAutoSlippage: smartSlippage && !isEoaEthFlow ? () => setSlippage(null) : undefined,
    }),
    [
      chainId,
      isEoaEthFlow,
      nativeCurrency.symbol,
      allowedSlippage,
      slippageLabel,
      slippageTooltip,
      smartSlippage,
      isSmartSlippageApplied,
      isTradePriceUpdating,
    ],
  )

  return <RowSlippageContent {...props} isSlippageModified={isSlippageModified} />
}
