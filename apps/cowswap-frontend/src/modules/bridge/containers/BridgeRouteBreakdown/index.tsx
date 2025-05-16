import { useMemo } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { getChainInfo, TokenWithLogo } from '@cowprotocol/common-const'
import { SolverInfo } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { InfoTooltip, UI } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import { ToggleArrow, DividerHorizontal } from 'modules/bridge/styles'
import { useUsdAmount } from 'modules/usdAmount'

import { SolverCompetition, ApiSolverCompetition } from 'common/hooks/orderProgressBar'
import { useSolversInfo } from 'common/hooks/useSolversInfo'
import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import { Wrapper, RouteHeader, RouteTitle, StopsInfo, CollapsibleStopsInfo, ClickableRouteHeader } from './styled'

import { useParsedAmountWithUsd } from '../../hooks'
import { BridgeStopDetails } from '../../pure/BridgeStopDetails/index'
import { SwapStopDetails } from '../../pure/SwapStopDetails/index'
import { BridgeFeeType, BridgeProtocolConfig } from '../../types'
import { StopStatusEnum } from '../../utils/status'

export interface BridgeRouteBreakdownProps {
  // Swap details
  sellCurrencyAmount: CurrencyAmount<TokenWithLogo>
  buyCurrencyAmount: CurrencyAmount<TokenWithLogo>
  networkCost: string
  swapMinReceive?: string
  swapExpectedToReceive?: string
  swapMaxSlippage?: string

  // Bridge details
  bridgeSendCurrencyAmount: CurrencyAmount<TokenWithLogo>
  bridgeReceiveCurrencyAmount: CurrencyAmount<TokenWithLogo>
  bridgeFee: string | BridgeFeeType
  maxBridgeSlippage: string
  estimatedTime: number
  recipient: string
  bridgeProvider: BridgeProtocolConfig

  // Optional props with defaults
  tokenLogoSize?: number
  hasBackground?: boolean
  swapStatus?: StopStatusEnum
  bridgeStatus?: StopStatusEnum

  // Display options
  hideBridgeFlowFiatAmount?: boolean
  hideRouteHeader?: boolean

  // Overall Accordion functionality
  isCollapsible?: boolean
  isExpanded?: boolean
  onExpandToggle?: () => void

  // Section-level accordion functionality
  isSwapSectionCollapsible?: boolean
  isSwapSectionExpanded?: boolean
  onSwapSectionToggle?: () => void
  isBridgeSectionCollapsible?: boolean
  isBridgeSectionExpanded?: boolean
  onBridgeSectionToggle?: () => void

  winningSolverId?: string | null
  receivedAmount?: CurrencyAmount<TokenWithLogo> | null
  surplusAmount?: CurrencyAmount<TokenWithLogo> | null
}

export function BridgeRouteBreakdown({
  sellCurrencyAmount,
  buyCurrencyAmount,
  networkCost,
  swapMinReceive,
  swapExpectedToReceive,
  swapMaxSlippage,
  bridgeSendCurrencyAmount,
  bridgeReceiveCurrencyAmount,
  bridgeFee,
  maxBridgeSlippage,
  estimatedTime,
  recipient,
  bridgeProvider,
  tokenLogoSize = 18,
  hasBackground = false,
  swapStatus,
  bridgeStatus,
  hideBridgeFlowFiatAmount = false,
  hideRouteHeader = false,
  isCollapsible = false,
  isExpanded = true,
  onExpandToggle = () => {},
  isSwapSectionCollapsible = false,
  isSwapSectionExpanded = true,
  onSwapSectionToggle = () => {},
  isBridgeSectionCollapsible = false,
  isBridgeSectionExpanded = true,
  onBridgeSectionToggle = () => {},
  winningSolverId,
  receivedAmount = null,
  surplusAmount = null,
}: BridgeRouteBreakdownProps) {
  const sellToken = sellCurrencyAmount.currency
  const buyToken = buyCurrencyAmount.currency

  const derivedSourceChainId = sellToken.chainId as SupportedChainId
  const sourceChainInfo = getChainInfo(derivedSourceChainId)
  const sourceChainName = sourceChainInfo.label

  const destToken = bridgeReceiveCurrencyAmount.currency
  const derivedRecipientChainId = destToken.chainId as SupportedChainId
  const recipientChainInfo = getChainInfo(derivedRecipientChainId)
  const recipientChainName = recipientChainInfo.label

  const allSolversInfo = useSolversInfo(derivedSourceChainId)

  const winningSolverDisplayInfo = useMemo(() => {
    if (!winningSolverId || !allSolversInfo || !Object.keys(allSolversInfo).length) {
      return undefined
    }
    const normalizedId = winningSolverId.replace(/-solve$/, '')
    return allSolversInfo[normalizedId]
  }, [winningSolverId, allSolversInfo])

  const winningSolverForSwapDetails: SolverCompetition | null = useMemo(() => {
    if (!winningSolverId) {
      return null
    }
    const baseSolverData: Pick<ApiSolverCompetition, 'solver'> = {
      solver: winningSolverId,
    }

    const displayInfo: Partial<SolverInfo> = winningSolverDisplayInfo || {}

    return {
      ...baseSolverData,
      ...displayInfo,
    } as SolverCompetition
  }, [winningSolverId, winningSolverDisplayInfo])

  const { usdInfo: networkCostUsdResult } = useParsedAmountWithUsd(networkCost, sellToken)
  const { usdInfo: swapMinReceiveUsdResult } = useParsedAmountWithUsd(swapMinReceive, buyToken)
  const { usdInfo: swapExpectedReceiveUsdResult } = useParsedAmountWithUsd(swapExpectedToReceive, buyToken)
  const bridgeReceiveAmountUsdInfo = useUsdAmount(bridgeReceiveCurrencyAmount, destToken)
  const rawReceivedAmountUsdInfo = useUsdAmount(receivedAmount, buyToken)
  const receivedAmountUsdInfo = receivedAmount ? rawReceivedAmountUsdInfo : null
  const rawSurplusAmountUsdInfo = useUsdAmount(surplusAmount, buyToken)
  const surplusAmountUsdInfo = surplusAmount ? rawSurplusAmountUsdInfo : null

  const handleHeaderClick = () => {
    if (isCollapsible) {
      onExpandToggle()
    }
  }

  const HeaderComponent = isCollapsible ? ClickableRouteHeader : RouteHeader

  const headerContent = (
    <HeaderComponent onClick={isCollapsible ? handleHeaderClick : undefined}>
      <RouteTitle>
        Route{' '}
        <InfoTooltip
          content={
            <>
              Your trade will be executed in 2 stops. First, you swap on <b>CoW Protocol (Stop 1)</b>, then you bridge
              via <b>{bridgeProvider.title} (Stop 2)</b>.
            </>
          }
          size={14}
        />
      </RouteTitle>
      {isCollapsible ? (
        <CollapsibleStopsInfo>
          2 stops
          <ProtocolIcons secondProtocol={bridgeProvider} />
          <ToggleArrow isOpen={isExpanded}>
            <SVG src={CarretIcon} title={isExpanded ? 'Close' : 'Open'} />
          </ToggleArrow>
        </CollapsibleStopsInfo>
      ) : (
        <StopsInfo>
          2 stops
          <ProtocolIcons secondProtocol={bridgeProvider} />
        </StopsInfo>
      )}
    </HeaderComponent>
  )

  if (isCollapsible && !isExpanded) {
    return <Wrapper hasBackground={hasBackground}>{!hideRouteHeader && headerContent}</Wrapper>
  }

  return (
    <Wrapper hasBackground={hasBackground}>
      {!hideRouteHeader && headerContent}

      <SwapStopDetails
        isCollapsible={isSwapSectionCollapsible}
        isExpanded={isSwapSectionExpanded}
        onToggle={onSwapSectionToggle}
        status={swapStatus}
        sellCurrencyAmount={sellCurrencyAmount}
        buyCurrencyAmount={buyCurrencyAmount}
        sourceChainName={sourceChainName}
        networkCost={networkCost}
        networkCostUsdResult={networkCostUsdResult}
        swapExpectedToReceive={swapExpectedToReceive}
        swapExpectedReceiveUsdResult={swapExpectedReceiveUsdResult}
        swapMaxSlippage={swapMaxSlippage}
        swapMinReceive={swapMinReceive}
        swapMinReceiveUsdResult={swapMinReceiveUsdResult}
        tokenLogoSize={tokenLogoSize}
        bridgeProvider={bridgeProvider}
        recipient={recipient}
        sourceChainId={derivedSourceChainId}
        winningSolver={winningSolverForSwapDetails}
        receivedAmount={receivedAmount}
        receivedAmountUsdResult={receivedAmountUsdInfo}
        surplusAmount={surplusAmount}
        surplusAmountUsdResult={surplusAmountUsdInfo}
      />

      <DividerHorizontal
        margin="8px 0 4px"
        overrideColor={hasBackground ? `var(${UI.COLOR_PAPER_DARKEST})` : undefined}
      />

      <BridgeStopDetails
        isCollapsible={isBridgeSectionCollapsible}
        isExpanded={isBridgeSectionExpanded}
        onToggle={onBridgeSectionToggle}
        status={bridgeStatus}
        bridgeProvider={bridgeProvider}
        bridgeSendCurrencyAmount={bridgeSendCurrencyAmount}
        bridgeReceiveCurrencyAmount={bridgeReceiveCurrencyAmount}
        recipientChainName={recipientChainName}
        hideBridgeFlowFiatAmount={hideBridgeFlowFiatAmount}
        bridgeReceiveAmountUsdResult={bridgeReceiveAmountUsdInfo}
        bridgeFee={bridgeFee}
        maxBridgeSlippage={maxBridgeSlippage}
        estimatedTime={estimatedTime}
        recipient={recipient}
        recipientChainId={derivedRecipientChainId}
        tokenLogoSize={tokenLogoSize}
      />
    </Wrapper>
  )
}
