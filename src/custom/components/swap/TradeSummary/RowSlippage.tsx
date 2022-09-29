import { useContext } from 'react'
import { Percent } from '@uniswap/sdk-core'
import styled, { ThemeContext } from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { ThemedText } from 'theme'

import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { INPUT_OUTPUT_EXPLANATION, PERCENTAGE_PRECISION } from 'constants/index'
import { StyledInfo } from 'cow-react/pages/Swap/styleds'
import { useToggleSettingsMenu } from 'state/application/hooks'
import { formatSmart } from 'utils/format'

const ClickableText = styled.button`
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 13px;
  color: ${({ theme }) => theme.text1};
`

export interface RowSlippageProps {
  allowedSlippage: Percent
  fontWeight?: number
  fontSize?: number
  rowHeight?: number
  showSettingOnClick?: boolean
}

export function RowSlippage({
  allowedSlippage,
  fontSize = 13,
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
        <ThemedText.Black fontSize={fontSize} fontWeight={fontWeight}>
          {showSettingOnClick ? (
            <ClickableText onClick={toggleSettings}>
              <Trans>Slippage tolerance</Trans>
            </ClickableText>
          ) : (
            <Trans>Slippage tolerance</Trans>
          )}
        </ThemedText.Black>
        <MouseoverTooltipContent
          bgColor={theme.bg3}
          color={theme.text1}
          wrap
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
      <ThemedText.Black textAlign="right" fontSize={fontSize} color={theme.text1}>
        <ClickableText onClick={() => (showSettingOnClick ? toggleSettings() : null)}>{displaySlippage}</ClickableText>
      </ThemedText.Black>
    </RowBetween>
  )
}
