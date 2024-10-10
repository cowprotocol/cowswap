import { useMemo } from 'react'

import { formatPercent } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import { useToggleSettingsMenu } from 'legacy/state/application/hooks'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { useIsSmartSlippageApplied } from 'modules/swap/hooks/useIsSmartSlippageApplied'
import { useSetSlippage } from 'modules/swap/hooks/useSetSlippage'
import { useSmartSwapSlippage } from 'modules/swap/hooks/useSwapSlippage'
import { useTradePricesUpdate } from 'modules/swap/hooks/useTradePricesUpdate'
import { RowSlippageContent } from 'modules/swap/pure/Row/RowSlippageContent'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export interface RowSlippageProps {
  allowedSlippage: Percent
  showSettingOnClick?: boolean
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
  isSlippageModified: boolean
}

export function RowSlippage({
  allowedSlippage,
  showSettingOnClick = true,
  slippageTooltip,
  slippageLabel,
  isSlippageModified,
}: RowSlippageProps) {
  const { chainId } = useWalletInfo()
  const toggleSettings = useToggleSettingsMenu()

  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()
  const smartSwapSlippage = useSmartSwapSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const setSlippage = useSetSlippage()
  const isTradePriceUpdating = useTradePricesUpdate()

  const props = useMemo(
    () => ({
      chainId,
      isEoaEthFlow,
      symbols: [nativeCurrency.symbol],
      showSettingOnClick,
      allowedSlippage,
      slippageLabel,
      slippageTooltip,
      displaySlippage: `${formatPercent(allowedSlippage)}%`,
      isSmartSlippageApplied,
      isSmartSlippageLoading: isTradePriceUpdating,
      smartSlippage: smartSwapSlippage && !isEoaEthFlow ? `${formatPercent(new Percent(smartSwapSlippage, 10_000))}%` : undefined,
      setAutoSlippage: smartSwapSlippage && !isEoaEthFlow ? () => setSlippage(null) : undefined,
    }),
    [chainId, isEoaEthFlow, nativeCurrency.symbol, showSettingOnClick, allowedSlippage, slippageLabel, slippageTooltip, smartSwapSlippage, isSmartSlippageApplied, isTradePriceUpdating]
  )

  return <RowSlippageContent {...props} toggleSettings={toggleSettings} isSlippageModified={isSlippageModified} />
}
