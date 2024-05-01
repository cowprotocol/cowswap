import { INPUT_OUTPUT_EXPLANATION, MINIMUM_ETH_FLOW_SLIPPAGE, PERCENTAGE_PRECISION } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { HoverTooltip, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { RowSlippageProps } from 'modules/swap/containers/Row/RowSlippage'
import { StyledRowBetween, TextWrapper } from 'modules/swap/pure/Row/styled'
import { RowStyleProps } from 'modules/swap/pure/Row/types'
import { StyledInfoIcon, TransactionText } from 'modules/swap/pure/styled'

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
    When selling {symbols?.[0] || 'a native currency'}, the minimum slippage tolerance is set to{' '}
    {MINIMUM_ETH_FLOW_SLIPPAGE.toSignificant(PERCENTAGE_PRECISION)}% to ensure a high likelihood of order matching,
    even in volatile market conditions.
    <br /><br />
    Orders on CoW Swap are always protected from MEV, so your slippage tolerance cannot be exploited.
  </Trans>
)
export const getNonNativeSlippageTooltip = () => (
  <Trans>
    Your slippage is MEV protected: all orders are submitted with tight spread (0.1%) on-chain.
    <br /><br />
    The slippage you pick here enables a resubmission of your order in case of unfavourable price movements.
    <br /><br />
    {INPUT_OUTPUT_EXPLANATION}
  </Trans>
)

export interface RowSlippageContentProps extends RowSlippageProps {
  toggleSettings: Command
  displaySlippage: string
  isEoaEthFlow: boolean
  symbols?: (string | undefined)[]
  wrappedSymbol?: string
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
  styleProps?: RowStyleProps
}

// TODO: RowDeadlineContent and RowSlippageContent are very similar. Refactor and extract base component?

export function RowSlippageContent(props: RowSlippageContentProps) {
  const {
    showSettingOnClick,
    toggleSettings,
    displaySlippage,
    isEoaEthFlow,
    symbols,
    slippageLabel,
    slippageTooltip,
    styleProps,
  } = props

  const tooltipContent =
    slippageTooltip || (isEoaEthFlow ? getNativeSlippageTooltip(symbols) : getNonNativeSlippageTooltip())

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          {showSettingOnClick ? (
            <ClickableText onClick={toggleSettings}>
              <SlippageTextContents isEoaEthFlow={isEoaEthFlow} slippageLabel={slippageLabel} />
            </ClickableText>
          ) : (
            <SlippageTextContents isEoaEthFlow={isEoaEthFlow} slippageLabel={slippageLabel} />
          )}
        </TextWrapper>
        <HoverTooltip wrapInContainer content={tooltipContent}>
          <StyledInfoIcon size={16} />
        </HoverTooltip>
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

type SlippageTextContentsProps = { isEoaEthFlow: boolean; slippageLabel?: React.ReactNode }

function SlippageTextContents({ isEoaEthFlow, slippageLabel }: SlippageTextContentsProps) {
  return (
    <TransactionText>
      <Trans>{slippageLabel || 'Slippage tolerance'}</Trans>
      {isEoaEthFlow && <i>(modified)</i>}
    </TransactionText>
  )
}
