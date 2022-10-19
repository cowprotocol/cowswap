import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { INPUT_OUTPUT_EXPLANATION } from 'constants/index'
import { StyledInfo } from '@cow/pages/Swap/styleds'
import { RowSlippageProps } from '@cow/modules/swap/containers/RowSlippage'
import { StyledRowBetween, TextWrapper } from '@cow/modules/swap/pure/Row/styled'
import { RowStyleProps } from '@cow/modules/swap/pure/Row/typings'
import { ThemedText } from 'theme/index'

const ClickableText = styled.button<{ isWarn?: boolean }>`
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 13px;
  color: ${({ isWarn, theme }) => theme[isWarn ? 'text2' : 'text1']};
`

export interface RowSlippageContentProps extends RowSlippageProps {
  toggleSettings: () => void
  displaySlippage: string
  showEthFlowSlippageWarning: boolean
  symbols?: (string | undefined)[]
  wrappedSymbol?: string

  styleProps?: RowStyleProps
}

export function RowSlippageContent(props: RowSlippageContentProps) {
  const { showSettingOnClick, toggleSettings, displaySlippage, showEthFlowSlippageWarning, symbols, styleProps } = props

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          {showEthFlowSlippageWarning ? (
            <Trans>
              Slippage tolerance{' '}
              <ThemedText.Warn display="inline-block" override>
                (modified)
              </ThemedText.Warn>
            </Trans>
          ) : showSettingOnClick ? (
            <ClickableText onClick={toggleSettings}>
              <Trans>Slippage tolerance</Trans>
            </ClickableText>
          ) : (
            <Trans>Slippage tolerance</Trans>
          )}
        </TextWrapper>
        <MouseoverTooltipContent
          wrap
          content={
            showEthFlowSlippageWarning ? (
              <Trans>
                <p>You are currently swapping {symbols?.[0] || 'a native token'}.</p>
                <p>
                  Slippage tolerance is defaulted to 2% to ensure a high likelihood of order matching, even in volatile
                  market situations.
                </p>
              </Trans>
            ) : (
              <Trans>
                <p>Your slippage is MEV protected: all orders are submitted with tight spread (0.1%) on-chain.</p>
                <p>
                  The slippage you pick here enables a resubmission of your order in case of unfavourable price
                  movements.
                </p>
                <p>{INPUT_OUTPUT_EXPLANATION}</p>
              </Trans>
            )
          }
        >
          <StyledInfo />
        </MouseoverTooltipContent>
      </RowFixed>
      <TextWrapper textAlign="right">
        {showSettingOnClick ? (
          <ClickableText onClick={toggleSettings}>{displaySlippage}</ClickableText>
        ) : (
          <span>{displaySlippage}</span>
        )}
      </TextWrapper>
    </StyledRowBetween>
  )
}
