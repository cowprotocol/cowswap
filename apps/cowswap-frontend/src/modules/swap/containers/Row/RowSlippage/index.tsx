import { useMemo } from 'react'

import { formatPercent } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import { useIsEoaEthFlow } from 'modules/trade'

import { useIsSmartSlippageApplied, useSetSlippage, useSmartTradeSlippage } from 'modules/tradeSlippage'
import { RowSlippageContent } from 'modules/swap/pure/Row/RowSlippageContent'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export interface RowSlippageProps {
  allowedSlippage: Percent
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
  isSlippageModified: boolean
}

export function RowSlippage({ allowedSlippage, slippageTooltip, slippageLabel, isSlippageModified }: RowSlippageProps) {
  const { chainId } = useWalletInfo()

  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()
  const smartSwapSlippage = useSmartTradeSlippage()
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
      smartSlippage:
        smartSwapSlippage && !isEoaEthFlow ? `${formatPercent(new Percent(smartSwapSlippage, 10_000))}%` : undefined,
      setAutoSlippage: smartSwapSlippage && !isEoaEthFlow ? () => setSlippage(null) : undefined,
    }),
    [
      chainId,
      isEoaEthFlow,
      nativeCurrency.symbol,
      allowedSlippage,
      slippageLabel,
      slippageTooltip,
      smartSwapSlippage,
      isSmartSlippageApplied,
    ],
  )

  return <RowSlippageContent {...props} isSlippageModified={isSlippageModified} />
}
