import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { INPUT_OUTPUT_EXPLANATION } from 'constants/index'
import { StyledInfo } from '../../styled'
import { RowSlippageProps } from '@cow/modules/swap/containers/RowSlippage'
import { StyledRowBetween, TextWrapper } from '@cow/modules/swap/pure/Row/styled'
import { RowStyleProps } from '@cow/modules/swap/pure/Row/typings'

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

export interface RowSlippageContentProps extends RowSlippageProps {
  toggleSettings: () => void
  displaySlippage: string
  styleProps?: RowStyleProps
}

export function RowSlippageContent(props: RowSlippageContentProps) {
  const { showSettingOnClick, toggleSettings, displaySlippage, styleProps } = props
  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          {showSettingOnClick ? (
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
      <TextWrapper textAlign="right">
        <ClickableText onClick={() => (showSettingOnClick ? toggleSettings() : null)}>{displaySlippage}</ClickableText>
      </TextWrapper>
    </StyledRowBetween>
  )
}
