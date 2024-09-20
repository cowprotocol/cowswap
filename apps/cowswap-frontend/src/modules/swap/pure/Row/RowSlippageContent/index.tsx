import { INPUT_OUTPUT_EXPLANATION, MINIMUM_ETH_FLOW_SLIPPAGE, PERCENTAGE_PRECISION } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { CenteredDots, HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

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

const DefaultSlippage = styled.span`
  display: inline-flex;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-decoration: strikethrough;
  font-size: 0.8em;

  a {
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: var(${UI.COLOR_TEXT});
    }
  }
`

export const getNativeSlippageTooltip = (chainId: SupportedChainId, symbols: (string | undefined)[] | undefined) => (
  <Trans>
    When selling {symbols?.[0] || 'a native currency'}, the minimum slippage tolerance is set to{' '}
    {MINIMUM_ETH_FLOW_SLIPPAGE[chainId].toSignificant(PERCENTAGE_PRECISION)}% to ensure a high likelihood of order
    matching, even in volatile market conditions.
    <br />
    <br />
    Orders on CoW Swap are always protected from MEV, so your slippage tolerance cannot be exploited.
  </Trans>
)
export const getNonNativeSlippageTooltip = () => (
  <Trans>
    Your slippage is MEV protected: all orders are submitted with tight spread (0.1%) on-chain.
    <br />
    <br />
    The slippage set enables a resubmission of your order in case of unfavourable price movements.
    <br />
    <br />
    {INPUT_OUTPUT_EXPLANATION}
  </Trans>
)

const SUGGESTED_SLIPPAGE_TOOLTIP = "Based on recent volatility for the selected token pair, this is the suggested slippage for ensuring quick execution of your order."

export interface RowSlippageContentProps {
  chainId: SupportedChainId
  toggleSettings: Command
  displaySlippage: string
  isEoaEthFlow: boolean
  symbols?: (string | undefined)[]
  wrappedSymbol?: string
  styleProps?: RowStyleProps
  allowedSlippage: Percent
  showSettingOnClick?: boolean
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
  isSlippageModified: boolean
  setAutoSlippage?: Command // todo: make them optional
  smartSlippage?: string
  isSmartSlippageApplied: boolean
  isSmartSlippageLoading: boolean
}

// TODO: RowDeadlineContent and RowSlippageContent are very similar. Refactor and extract base component?

export function RowSlippageContent(props: RowSlippageContentProps) {
  const {
    chainId,
    showSettingOnClick,
    toggleSettings,
    displaySlippage,
    isEoaEthFlow,
    symbols,
    slippageLabel,
    slippageTooltip,
    styleProps,
    isSlippageModified,
    setAutoSlippage,
    smartSlippage,
    isSmartSlippageApplied,
    isSmartSlippageLoading,
  } = props

  const tooltipContent =
    slippageTooltip || (isEoaEthFlow ? getNativeSlippageTooltip(chainId, symbols) : getNonNativeSlippageTooltip())

  // In case the user happened to set the same slippage as the suggestion, do not show the suggestion
  const suggestedEqualToUserSlippage = smartSlippage && smartSlippage === displaySlippage

  const displayDefaultSlippage = isSlippageModified && setAutoSlippage && smartSlippage && !suggestedEqualToUserSlippage && (
    <DefaultSlippage>
      {isSmartSlippageLoading ? (<CenteredDots />) : (
        <>
          <LinkStyledButton onClick={setAutoSlippage}>(Suggested: {smartSlippage})</LinkStyledButton>
          <HoverTooltip wrapInContainer content={SUGGESTED_SLIPPAGE_TOOLTIP}>
            <StyledInfoIcon size={16} />
          </HoverTooltip>
        </>
      )}
    </DefaultSlippage>
  )
  const loading = isSmartSlippageLoading && isSmartSlippageApplied && (<CenteredDots />)

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          {showSettingOnClick ? (
            <ClickableText onClick={toggleSettings}>
              <SlippageTextContents isEoaEthFlow={isEoaEthFlow} slippageLabel={slippageLabel} isDynamicSlippageSet={isSmartSlippageApplied} />
            </ClickableText>
          ) : (
            <SlippageTextContents isEoaEthFlow={isEoaEthFlow} slippageLabel={slippageLabel} isDynamicSlippageSet={isSmartSlippageApplied} />
          )}
        </TextWrapper>
        <HoverTooltip wrapInContainer content={tooltipContent}>
          <StyledInfoIcon size={16} />
        </HoverTooltip>
      </RowFixed>
      <TextWrapper textAlign="right">
        {showSettingOnClick ? (
          <ClickableText onClick={toggleSettings}>
            {loading ? loading : (<>{displaySlippage}{displayDefaultSlippage}</>)}
          </ClickableText>
        ) : (
          <span>
            {loading ? loading : (<>{displaySlippage}{displayDefaultSlippage}</>)}
          </span>
        )}
      </TextWrapper>
    </StyledRowBetween>
  )
}

type SlippageTextContentsProps = { isEoaEthFlow: boolean; slippageLabel?: React.ReactNode, isDynamicSlippageSet: boolean }

function SlippageTextContents({ isEoaEthFlow, slippageLabel, isDynamicSlippageSet }: SlippageTextContentsProps) {
  return (
    <TransactionText>
      <Trans>{slippageLabel || 'Slippage tolerance'}</Trans>
      {isEoaEthFlow && <i>(modified)</i>}
      {isDynamicSlippageSet && <i>(dynamic)</i>}
    </TransactionText>
  )
}
