import { useMemo } from 'react'

import { formatPercent } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import { useToggleSettingsMenu } from 'legacy/state/application/hooks'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { RowSlippageContent } from 'modules/swap/pure/Row/RowSlippageContent'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export interface RowSlippageProps {
  allowedSlippage: Percent
  showSettingOnClick?: boolean
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
}

export function RowSlippage({
  allowedSlippage,
  showSettingOnClick = true,
  slippageTooltip,
  slippageLabel,
}: RowSlippageProps) {
  const toggleSettings = useToggleSettingsMenu()

  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()

  const props = useMemo(
    () => ({
      isEoaEthFlow,
      symbols: [nativeCurrency.symbol],
      showSettingOnClick,
      allowedSlippage,
      slippageLabel,
      slippageTooltip,
      displaySlippage: `${formatPercent(allowedSlippage)}%`,
    }),
    [isEoaEthFlow, nativeCurrency.symbol, showSettingOnClick, allowedSlippage, slippageLabel, slippageTooltip]
  )

  return <RowSlippageContent {...props} toggleSettings={toggleSettings} />
}
