import { useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { CenteredDots, HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
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

export interface RowSlippageContentProps {
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
  isDefaultSlippageApplied: boolean
  isSmartSlippageApplied: boolean
  isSmartSlippageLoading: boolean
  hideRecommendedSlippage?: boolean
}

export function RowSlippageContent(props: RowSlippageContentProps): ReactNode {
  const { t } = useLingui()
  const SUGGESTED_SLIPPAGE_TOOLTIP = t`This is the recommended slippage tolerance based on current gas prices & trade size. A lower amount may result in slower execution.`
  const {
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
    isDefaultSlippageApplied,
    hideRecommendedSlippage,
  } = props

  const setSettingTabState = useSetAtom(settingsTabStateAtom)
  const openSettings: () => void = () => setSettingTabState({ open: true })

  const tooltipContent =
    slippageTooltip ||
    (isEoaEthFlow ? getNativeSlippageTooltip(symbols) : getNonNativeSlippageTooltip({ isDynamic: !!smartSlippage }))

  // In case the user happened to set the same slippage as the suggestion, do not show the suggestion
  const suggestedEqualToUserSlippage = smartSlippage && smartSlippage === displaySlippage

  const displayDefaultSlippage = !hideRecommendedSlippage &&
    isSlippageModified &&
    setAutoSlippage &&
    smartSlippage &&
    !suggestedEqualToUserSlippage && (
      <DefaultSlippage>
        {isSmartSlippageLoading ? (
          <CenteredDots />
        ) : (
          <>
            <LinkStyledButton onClick={setAutoSlippage}>
              (<Trans>Recommended</Trans>: {smartSlippage})
            </LinkStyledButton>
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
            isDefaultSlippageApplied={isDefaultSlippageApplied}
            slippageLabel={slippageLabel}
            isEoaEthFlow={isEoaEthFlow}
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
  isDefaultSlippageApplied: boolean
  slippageLabel?: React.ReactNode
  isDynamicSlippageSet: boolean
}

function SlippageTextContents({
  slippageLabel,
  isDynamicSlippageSet,
  isEoaEthFlow,
  isDefaultSlippageApplied,
}: SlippageTextContentsProps): ReactNode {
  const { t } = useLingui()

  return (
    <TransactionText>
      {slippageLabel || t`Slippage tolerance`}
      {isDynamicSlippageSet && !isDefaultSlippageApplied && (
        <i>
          <Trans>(dynamic)</Trans>
        </i>
      )}
      {isEoaEthFlow && isDefaultSlippageApplied && (
        <i>
          <Trans>(modified)</Trans>
        </i>
      )}
    </TransactionText>
  )
}
