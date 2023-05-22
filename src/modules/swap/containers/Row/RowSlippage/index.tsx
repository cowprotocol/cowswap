import { useMemo } from 'react'
import { Percent } from '@uniswap/sdk-core'

import { useToggleSettingsMenu } from 'legacy/state/application/hooks'
import { RowSlippageContent } from 'modules/swap/pure/Row/RowSlippageContent'
import { useIsEthFlow } from 'modules/swap/hooks/useIsEthFlow'
import { useDetectNativeToken } from 'modules/swap/hooks/useDetectNativeToken'
import { formatPercent } from 'utils/amountFormat'

export interface RowSlippageProps {
  allowedSlippage: Percent
  showSettingOnClick?: boolean
}

export function RowSlippage({ allowedSlippage, showSettingOnClick = true }: RowSlippageProps) {
  const toggleSettings = useToggleSettingsMenu()

  const isEthFlow = useIsEthFlow()
  const { native: nativeCurrency } = useDetectNativeToken()

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
