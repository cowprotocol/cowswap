import { useContext, useMemo } from 'react'
import { Percent } from '@uniswap/sdk-core'
import { ThemeContext } from 'styled-components/macro'

import { PERCENTAGE_PRECISION } from 'constants/index'
import { useToggleSettingsMenu } from 'state/application/hooks'
import { formatSmart } from 'utils/format'
import { RowSlippageContent } from '@cow/modules/swap/pure/Row/RowSlippageContent'
import { RowCommonProps } from '@cow/modules/swap/pure/Row/typings'

export interface RowSlippageProps extends Omit<RowCommonProps, 'showHelpers'> {
  allowedSlippage: Percent
  showSettingOnClick?: boolean
}

export function RowSlippage({
  allowedSlippage,
  fontSize = 13,
  fontWeight = 500,
  rowHeight,
  showSettingOnClick = true,
}: Omit<RowSlippageProps, 'theme'>) {
  const theme = useContext(ThemeContext)
  const toggleSettings = useToggleSettingsMenu()
  const props = useMemo(
    () => ({
      fontSize,
      fontWeight,
      rowHeight,
      showSettingOnClick,
      allowedSlippage,
      displaySlippage: `${formatSmart(allowedSlippage, PERCENTAGE_PRECISION)}%`,
    }),
    [allowedSlippage, fontSize, fontWeight, rowHeight, showSettingOnClick]
  )

  return <RowSlippageContent {...props} theme={theme} toggleSettings={toggleSettings} />
}
