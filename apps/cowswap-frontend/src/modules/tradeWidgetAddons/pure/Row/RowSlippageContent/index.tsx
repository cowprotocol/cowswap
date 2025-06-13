import { useSetAtom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { CenteredDots, HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from 'common/utils/tradeSettingsTooltips'

import { settingsTabStateAtom } from '../../../state/settingsTabState'
import { RowStyleProps, StyledInfoIcon, StyledRowBetween, TextWrapper, TransactionText } from '../styled'

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

const SUGGESTED_SLIPPAGE_TOOLTIP =
  'This is the recommended slippage tolerance based on current gas prices & trade size. A lower amount may result in slower execution.'

export interface RowSlippageContentProps {
  chainId: SupportedChainId
  displaySlippage: string
  isEoaEthFlow: boolean
  symbols?: (string | undefined)[]
  wrappedSymbol?: string
  styleProps?: RowStyleProps
  allowedSlippage: Percent
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
  isSlippageModified: boolean
  setAutoSlippage?: Command // todo: make them optional
  smartSlippage?: string
  isSmartSlippageApplied: boolean
  isSmartSlippageLoading: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function RowSlippageContent(props: RowSlippageContentProps) {
  const {
    chainId,
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

  const setSettingTabState = useSetAtom(settingsTabStateAtom)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const openSettings = () => setSettingTabState({ open: true })

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
        <TextWrapper onClick={openSettings}>
          <SlippageTextContents
            isEoaEthFlow={isEoaEthFlow}
            slippageLabel={slippageLabel}
            isDynamicSlippageSet={isSmartSlippageApplied}
          />
        </TextWrapper>
        <HoverTooltip wrapInContainer content={tooltipContent}>
          <StyledInfoIcon size={16} />
        </HoverTooltip>
      </RowFixed>
      <TextWrapper textAlign="right" onClick={openSettings}>
        <span>{displaySlippageWithLoader}</span>
      </TextWrapper>
    </StyledRowBetween>
  )
}

type SlippageTextContentsProps = {
  isEoaEthFlow: boolean
  slippageLabel?: React.ReactNode
  isDynamicSlippageSet: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function SlippageTextContents({ isEoaEthFlow, slippageLabel, isDynamicSlippageSet }: SlippageTextContentsProps) {
  return (
    <TransactionText>
      <Trans>{slippageLabel || 'Slippage tolerance'}</Trans>
      {isEoaEthFlow && <i>(modified)</i>}
      {isDynamicSlippageSet && <i>(dynamic)</i>}
    </TransactionText>
  )
}
