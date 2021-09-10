import React, { useContext } from 'react'
import { Percent } from '@uniswap/sdk-core'
import { ThemeContext } from 'styled-components'
import { Trans } from '@lingui/macro'
import { TYPE } from 'theme'

import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { INPUT_OUTPUT_EXPLANATION, PERCENTAGE_PRECISION } from 'constants/index'
import { StyledInfo } from 'pages/Swap/styleds'
import { ClickableText } from 'pages/Pool/styleds'
import { useToggleSettingsMenu } from 'state/application/hooks'
import { formatSmart } from 'utils/format'

export interface RowSlippageProps {
  allowedSlippage: Percent
  fontWeight?: number
  fontSize?: number
  rowHeight?: number
  showSettingOnClick?: boolean
}
export function RowSlippage({
  allowedSlippage,
  fontSize = 14,
  fontWeight = 500,
  rowHeight,
  showSettingOnClick = true,
}: RowSlippageProps) {
  const theme = useContext(ThemeContext)
  const toggleSettings = useToggleSettingsMenu()
  const displaySlippage = `${formatSmart(allowedSlippage, PERCENTAGE_PRECISION)}%`

  return (
    <RowBetween height={rowHeight}>
      <RowFixed>
        <TYPE.black fontSize={fontSize} fontWeight={fontWeight} color={theme.text2}>
          {showSettingOnClick ? (
            <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
              <Trans>Slippage tolerance</Trans>
            </ClickableText>
          ) : (
            <Trans>Slippage tolerance</Trans>
          )}
        </TYPE.black>
        <MouseoverTooltipContent
          bgColor={theme.bg3}
          color={theme.text1}
          content={
            <Trans>
              <p>Your slippage is MEV protected: all orders are submitted with tight spread (0.1%) on-chain.</p>
              <p>
                The slippage you pick here enables a resubmission of your order in case of unfavourable price movements.
              </p>
              <p>{INPUT_OUTPUT_EXPLANATION}</p>
            </Trans>
          }
        >
          <StyledInfo />
        </MouseoverTooltipContent>
      </RowFixed>
      <TYPE.black textAlign="right" fontSize={fontSize} color={theme.text1}>
        {showSettingOnClick ? (
          <ClickableText onClick={toggleSettings}>{displaySlippage}</ClickableText>
        ) : (
          <span>{displaySlippage}</span>
        )}
      </TYPE.black>
    </RowBetween>
  )
}
