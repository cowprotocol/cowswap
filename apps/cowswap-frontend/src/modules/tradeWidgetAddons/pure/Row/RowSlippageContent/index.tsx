import { useSetAtom } from 'jotai'
import { ReactNode, useMemo } from 'react'

import { Command } from '@cowprotocol/types'
import { CenteredDots, HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { useIsCurrentTradeBridging } from 'modules/trade/hooks/useIsCurrentTradeBridging'
import { useIsHooksTradeType } from 'modules/trade/hooks/useIsHooksTradeType'
import { useTradeTypeInfo } from 'modules/trade/hooks/useTradeTypeInfo'
import { TradeType } from 'modules/trade/types/TradeType'

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
  tradeType?: TradeType
  isBridging?: boolean
}

export function RowSlippageContent(props: RowSlippageContentProps): ReactNode {
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
    tradeType,
    isBridging,
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
            isDefaultSlippageApplied={isDefaultSlippageApplied}
            slippageLabel={slippageLabel}
            isEoaEthFlow={isEoaEthFlow}
            isDynamicSlippageSet={isSmartSlippageApplied}
            tradeType={tradeType}
            isBridging={isBridging}
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
  tradeType?: TradeType
  isBridging?: boolean
}

function SlippageTextContents({
  slippageLabel,
  isDynamicSlippageSet,
  isEoaEthFlow,
  isDefaultSlippageApplied,
  tradeType,
  isBridging,
}: SlippageTextContentsProps): ReactNode {
  // Use hooks to get dynamic values
  const tradeTypeInfo = useTradeTypeInfo()
  const isHooks = useIsHooksTradeType()
  const isBridgeActive = useIsCurrentTradeBridging()

  // Compute default label based on trade type and bridging status
  const defaultLabel = useMemo((): string => {
    // Use hook values if available, fall back to props for backward compatibility
    const currentTradeType = tradeTypeInfo?.tradeType ?? tradeType
    const isBridge = isBridgeActive ?? isBridging

    // SWAP (non-hooks) OR BRIDGE → "Max. swap slippage"
    if ((currentTradeType === TradeType.SWAP && !isHooks) || isBridge) {
      return 'Max. swap slippage'
    }

    // LIMIT, TWAP, HOOKS → "Slippage tolerance"
    return 'Slippage tolerance'
  }, [tradeTypeInfo, tradeType, isHooks, isBridgeActive, isBridging])

  return (
    <TransactionText>
      <Trans>{slippageLabel || defaultLabel}</Trans>
      {isDynamicSlippageSet && !isDefaultSlippageApplied && <i>(dynamic)</i>}
      {isEoaEthFlow && isDefaultSlippageApplied && <i>(modified)</i>}
    </TransactionText>
  )
}
