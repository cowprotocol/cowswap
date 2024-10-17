import { MINIMUM_ETH_FLOW_SLIPPAGE, PERCENTAGE_PRECISION } from '@cowprotocol/common-const'
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
    {symbols?.[0] || 'Native currency'} orders can, in rare cases, be frontrun due to their on-chain component. For more
    robust MEV protection, consider wrapping your {symbols?.[0] || 'native currency'} before trading.
  </Trans>
)

export const getNonNativeSlippageTooltip = (params?: { isDynamic?: boolean; isSettingsModal?: boolean }) => (
  <Trans>
    {params?.isDynamic ? (
      <>
        CoW Swap dynamically adjusts your slippage tolerance to ensure your trade executes quickly while still getting
        the best price.{' '}
        {params?.isSettingsModal ? (
          <>
            To override this, enter your desired slippage amount.
            <br />
            <br />
            Either way, your slippage is protected from MEV!
          </>
        ) : (
          <>
            <br />
            <br />
            Trades are protected from MEV, so your slippage can't be exploited!
          </>
        )}
      </>
    ) : (
      <>CoW Swap trades are protected from MEV, so your slippage can't be exploited!</>
    )}
  </Trans>
)

const SUGGESTED_SLIPPAGE_TOOLTIP =
  'This is the recommended slippage tolerance based on current gas prices & volatility. A lower amount may result in slower execution.'

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
    slippageTooltip ||
    (isEoaEthFlow
      ? getNativeSlippageTooltip(chainId, symbols)
      : getNonNativeSlippageTooltip({ isDynamic: !!smartSlippage }))

  // In case the user happened to set the same slippage as the suggestion, do not show the suggestion
  const suggestedEqualToUserSlippage = smartSlippage && smartSlippage === displaySlippage

  const displayDefaultSlippage = isSlippageModified &&
    setAutoSlippage &&
    smartSlippage &&
    !suggestedEqualToUserSlippage && (
      <DefaultSlippage>
        {isSmartSlippageLoading ? (
          <CenteredDots />
        ) : (
          <>
            <LinkStyledButton onClick={setAutoSlippage}>(Recommended: {smartSlippage})</LinkStyledButton>
            <HoverTooltip wrapInContainer content={SUGGESTED_SLIPPAGE_TOOLTIP}>
              <StyledInfoIcon size={16} />
            </HoverTooltip>
          </>
        )}
      </DefaultSlippage>
    )

  const displaySlippageWithLoader =
    isSmartSlippageLoading && isSmartSlippageApplied ? (
      <CenteredDots />
    ) : (
      <>
        {displaySlippage}
        {displayDefaultSlippage}
      </>
    )

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          {showSettingOnClick ? (
            <ClickableText onClick={toggleSettings}>
              <SlippageTextContents
                isEoaEthFlow={isEoaEthFlow}
                slippageLabel={slippageLabel}
                isDynamicSlippageSet={isSmartSlippageApplied}
              />
            </ClickableText>
          ) : (
            <SlippageTextContents
              isEoaEthFlow={isEoaEthFlow}
              slippageLabel={slippageLabel}
              isDynamicSlippageSet={isSmartSlippageApplied}
            />
          )}
        </TextWrapper>
        <HoverTooltip wrapInContainer content={tooltipContent}>
          <StyledInfoIcon size={16} />
        </HoverTooltip>
      </RowFixed>
      <TextWrapper textAlign="right">
        {showSettingOnClick ? (
          <ClickableText onClick={toggleSettings}>{displaySlippageWithLoader}</ClickableText>
        ) : (
          <span>{displaySlippageWithLoader}</span>
        )}
      </TextWrapper>
    </StyledRowBetween>
  )
}

type SlippageTextContentsProps = {
  isEoaEthFlow: boolean
  slippageLabel?: React.ReactNode
  isDynamicSlippageSet: boolean
}

function SlippageTextContents({ isEoaEthFlow, slippageLabel, isDynamicSlippageSet }: SlippageTextContentsProps) {
  return (
    <TransactionText>
      <Trans>{slippageLabel || 'Slippage tolerance'}</Trans>
      {isEoaEthFlow && <i>(modified)</i>}
      {isDynamicSlippageSet && <i>(dynamic)</i>}
    </TransactionText>
  )
}
