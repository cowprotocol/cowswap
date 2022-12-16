import { useMemo } from 'react'
import { Percent } from '@uniswap/sdk-core'

import { PERCENTAGE_PRECISION } from 'constants/index'
import { useToggleSettingsMenu } from 'state/application/hooks'
import { formatSmart } from 'utils/format'
import { RowSlippageContent } from '@cow/modules/swap/pure/Row/RowSlippageContent'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'

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
      displaySlippage: `${formatSmart(allowedSlippage, PERCENTAGE_PRECISION)}%`,
    }),
    [allowedSlippage, nativeCurrency, isEthFlow, showSettingOnClick]
  )

  return <RowSlippageContent {...props} toggleSettings={toggleSettings} />
}
