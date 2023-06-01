import { useMemo } from 'react'

import { Percent } from '@uniswap/sdk-core'

import { useToggleSettingsMenu } from 'legacy/state/application/hooks'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { RowSlippageContent } from 'modules/swap/pure/Row/RowSlippageContent'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { formatPercent } from 'utils/amountFormat'

export interface RowSlippageProps {
  allowedSlippage: Percent
  showSettingOnClick?: boolean
}

export function RowSlippage({ allowedSlippage, showSettingOnClick = true }: RowSlippageProps) {
  const toggleSettings = useToggleSettingsMenu()

  const isEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()

  const props = useMemo(
    () => ({
      isEthFlow,
      symbols: [nativeCurrency.symbol],
      showSettingOnClick,
      allowedSlippage,
      displaySlippage: `${formatPercent(allowedSlippage)}%`,
    }),
    [allowedSlippage, nativeCurrency, isEthFlow, showSettingOnClick]
  )

  return <RowSlippageContent {...props} toggleSettings={toggleSettings} />
}
