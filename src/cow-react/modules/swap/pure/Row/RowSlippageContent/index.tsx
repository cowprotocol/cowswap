import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { RowStyleProps } from '@cow/modules/swap/pure/Row/types'
import { INPUT_OUTPUT_EXPLANATION, PERCENTAGE_PRECISION } from 'constants/index'
import { RowSlippageProps } from '@cow/modules/swap/containers/Row/RowSlippage'
import { StyledRowBetween, TextWrapper } from '@cow/modules/swap/pure/Row/styled'
import { ThemedText } from 'theme/index'
import { ETH_FLOW_SLIPPAGE } from '@cow/modules/swap/state/EthFlow/updaters/EthFlowSlippageUpdater'
import { StyledInfoIcon } from '@cow/modules/swap/pure/styled'

export const ClickableText = styled.button`
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;

  > div {
    display: inline-block;
  }
`

export const getNativeSlippageTooltip = (symbols: (string | undefined)[] | undefined) => (
  <Trans>
    <p>Your slippage is MEV protected.</p>
    <p>
      When swapping {symbols?.[0] || 'a native currency'}, the minimum slippage tolerance is set to{' '}
      {ETH_FLOW_SLIPPAGE.toSignificant(PERCENTAGE_PRECISION)}% to ensure a high likelihood of order matching, even in
      volatile market situations.
    </p>
  </Trans>
)
export const getNonNativeSlippageTooltip = () => (
  <Trans>
    <p>Your slippage is MEV protected: all orders are submitted with tight spread (0.1%) on-chain.</p>
    <p>The slippage you pick here enables a resubmission of your order in case of unfavourable price movements.</p>
    <p>{INPUT_OUTPUT_EXPLANATION}</p>
  </Trans>
)

export interface RowSlippageContentProps extends RowSlippageProps {
  toggleSettings: () => void
  displaySlippage: string
  isEthFlow: boolean
  symbols?: (string | undefined)[]
  wrappedSymbol?: string

  styleProps?: RowStyleProps
}

// TODO: RowDeadlineContent and RowSlippageContent are very similar. Refactor and extract base component?

export function RowSlippageContent(props: RowSlippageContentProps) {
  const { showSettingOnClick, toggleSettings, displaySlippage, isEthFlow, symbols, styleProps } = props

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          {showSettingOnClick ? (
            <ClickableText onClick={toggleSettings}>
              <SlippageTextContents isEthFlow={isEthFlow} />
            </ClickableText>
          ) : (
            <SlippageTextContents isEthFlow={isEthFlow} />
          )}
        </TextWrapper>
        <MouseoverTooltipContent
          wrap
          content={isEthFlow ? getNativeSlippageTooltip(symbols) : getNonNativeSlippageTooltip()}
        >
          <StyledInfoIcon size={16} />
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

type SlippageTextContentsProps = { isEthFlow: boolean }

function SlippageTextContents({ isEthFlow }: SlippageTextContentsProps) {
  return (
    <>
      <Trans>Slippage tolerance</Trans>
      {isEthFlow && (
        <>
          {' '}
          <ThemedText.Warn override>(modified)</ThemedText.Warn>
        </>
      )}
    </>
  )
}
