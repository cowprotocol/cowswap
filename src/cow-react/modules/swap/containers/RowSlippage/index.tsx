import { useMemo } from 'react'
import { Percent } from '@uniswap/sdk-core'

import { PERCENTAGE_PRECISION } from 'constants/index'
import { useToggleSettingsMenu } from 'state/application/hooks'
import { formatSmart } from 'utils/format'
import { RowSlippageContent } from '@cow/modules/swap/pure/Row/RowSlippageContent'

export interface RowSlippageProps {
  allowedSlippage: Percent
  showSettingOnClick?: boolean
}

export function RowSlippage({ allowedSlippage, showSettingOnClick = true }: RowSlippageProps) {
  const toggleSettings = useToggleSettingsMenu()
  const props = useMemo(
    () => ({
      showSettingOnClick,
      allowedSlippage,
      displaySlippage: `${formatSmart(allowedSlippage, PERCENTAGE_PRECISION)}%`,
    }),
    [allowedSlippage, showSettingOnClick]
  )

  return <RowSlippageContent {...props} toggleSettings={toggleSettings} />
}
