import { useMemo, useCallback, ReactNode } from 'react'

import { getChainInfo, TokenWithLogo } from '@cowprotocol/common-const'
import { SolverInfo } from '@cowprotocol/core'
import { BridgeQuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { InfoTooltip, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { DividerHorizontal } from 'modules/bridge/styles'
import { ReceiveAmountInfo, useDerivedTradeState } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'
import { useUsdAmount } from 'modules/usdAmount'

import { SolverCompetition, ApiSolverCompetition } from 'common/hooks/orderProgressBar'
import { useSolversInfo } from 'common/hooks/useSolversInfo'
import { ProtocolIcons } from 'common/pure/ProtocolIcons'
import { ToggleArrow } from 'common/pure/ToggleArrow'

import { Wrapper, RouteHeader, RouteTitle, StopsInfo, CollapsibleStopsInfo, ClickableRouteHeader } from './styled'

import { BridgeStopDetails } from '../../pure/BridgeStopDetails'
import { SwapStopDetails } from '../../pure/SwapStopDetails'
import { BridgeProtocolConfig } from '../../types'
import { StopStatusEnum } from '../../utils'

export interface BridgeRouteBreakdownProps {
  receiveAmountInfo: ReceiveAmountInfo
  bridgeQuote: BridgeQuoteResults

  maxBridgeSlippage?: string
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

  winningSolverId?: string | null
  receivedAmount?: CurrencyAmount<TokenWithLogo> | null
  surplusAmount?: CurrencyAmount<TokenWithLogo> | null
  swapExplorerUrl?: string
  bridgeExplorerUrl?: string
  collapsedDefault?: ReactNode
}

export function BridgeRouteBreakdown({
  receiveAmountInfo,
  bridgeQuote,
  maxBridgeSlippage,
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
  winningSolverId,
  receivedAmount = null,
  surplusAmount = null,
  swapExplorerUrl,
  bridgeExplorerUrl,
  collapsedDefault,
}: BridgeRouteBreakdownProps) {
  const { account } = useWalletInfo()
  const tokensByAddress = useTokensByAddressMap()
  const { recipient } = useDerivedTradeState() || {}
  const swapSlippage = useTradeSlippage()

  const { sellAmount, buyAmount } = receiveAmountInfo.afterSlippage
  const { networkFee } = receiveAmountInfo.costs
  const sellToken = sellAmount.currency

  const swapExpectedToReceive = receiveAmountInfo.afterNetworkCosts.buyAmount

  const intermediateBuyTokenAddress = bridgeQuote.tradeParameters.sellTokenAddress
  const intermediateBuyToken = tokensByAddress[intermediateBuyTokenAddress.toLowerCase()]!
  const intermediateBuyAmountRaw = bridgeQuote.amountsAndCosts.beforeFee.sellAmount
  const intermediateBuyAmount = CurrencyAmount.fromRawAmount(intermediateBuyToken, intermediateBuyAmountRaw.toString())

  const bridgeReceiveCurrencyAmount = CurrencyAmount.fromRawAmount(
    buyAmount.currency,
    bridgeQuote.amountsAndCosts.afterSlippage.buyAmount.toString(),
  )
  const bridgeFee = CurrencyAmount.fromRawAmount(
    intermediateBuyToken,
    bridgeQuote.amountsAndCosts.costs.bridgingFee.amountInSellCurrency.toString(),
  )

  // Determine if we are in a mode where statuses are actively displayed (like the BridgeStatus fixture)
  // This is true if swapStatus is provided, indicating a status-aware context.
  const isInStatusDisplayMode = typeof swapStatus !== 'undefined'

  // Derive chain information
  // This only needs to be recomputed when the chain ID changes
  const sourceChainData = useMemo(() => {
    const chainId = sellToken.chainId as SupportedChainId
    const info = getChainInfo(chainId)
    return {
      chainId,
      chainInfo: info,
      chainName: info.label,
    }
  }, [sellToken.chainId])

  const destChainData = useMemo(() => {
    const currentChainId = bridgeReceiveCurrencyAmount.currency.chainId // this is 'number'
    const info = getChainInfo(currentChainId) // Accepts number, returns ChainInfo | undefined

    // TODO: use getChainInfo from brdigeProvider instead
    if (!info) {
      console.warn(`Chain info not found for chainId: ${currentChainId} in BridgeRouteBreakdown. Using fallback.`)
      // Return a structure that won't crash downstream and provides sensible fallbacks.
      return {
        chainId: currentChainId, // Pass the original number
        chainInfo: undefined,
        chainName: 'Unsupported Chain', // Fallback name
      }
    }

    // At this point, 'info' is valid, implying currentChainId is a supported one.
    return {
      chainId: currentChainId as SupportedChainId,
      chainInfo: info,
      chainName: info.label,
    }
  }, [bridgeReceiveCurrencyAmount.currency.chainId])

  const allSolversInfo = useSolversInfo(sourceChainData.chainId)

  // This is a computation that depends on external data (solversInfo) that might change,
  // so we should memoize it to avoid unnecessary recalculations
  const winningSolverDisplayInfo = useMemo(() => {
    if (!winningSolverId || !allSolversInfo || !Object.keys(allSolversInfo).length) {
      return undefined
    }
    const normalizedId = winningSolverId.replace(/-solve$/, '')
    return allSolversInfo[normalizedId]
  }, [winningSolverId, allSolversInfo])

  // Given that this is a complex object being built that's used in a child component,
  // memoization makes sense to prevent unnecessary re-renderings
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

  // networkCost, swapMinReceive, and swapExpectedToReceive are now expected as CurrencyAmount
  const networkCostUsdInfo = useUsdAmount(networkFee.amountInSellCurrency)
  const swapMinReceiveUsdInfo = useUsdAmount(receiveAmountInfo.afterSlippage.buyAmount)
  const swapExpectedReceiveUsdInfo = useUsdAmount(swapExpectedToReceive)

  const { value: bridgeReceiveAmountUsd } = useUsdAmount(bridgeReceiveCurrencyAmount)
  const rawReceivedAmountUsdInfo = useUsdAmount(receivedAmount)
  const receivedAmountUsdInfo = receivedAmount ? rawReceivedAmountUsdInfo : null
  const rawSurplusAmountUsdInfo = useUsdAmount(surplusAmount)
  const surplusAmountUsdInfo = surplusAmount ? rawSurplusAmountUsdInfo : null

  // This is a potentially expensive callback that will be passed to a child component
  const handleHeaderClick = useCallback(() => {
    if (isCollapsible) {
      onExpandToggle()
    }
  }, [isCollapsible, onExpandToggle])

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
          <ToggleArrow isOpen={isExpanded} />
        </CollapsibleStopsInfo>
      ) : (
        <StopsInfo>
          2 stops
          <ProtocolIcons secondProtocol={bridgeProvider} />
        </StopsInfo>
      )}
    </HeaderComponent>
  )

  if (!account) return null

  // Logic for when the main component is collapsed
  if (isCollapsible && !isExpanded) {
    // Render header and then the collapsedDefault content if provided
    return (
      <Wrapper hasBackground={hasBackground}>
        {!hideRouteHeader && headerContent}
        {collapsedDefault}
      </Wrapper>
    )
  }

  return (
    <Wrapper hasBackground={hasBackground}>
      {!hideRouteHeader && headerContent}

      <SwapStopDetails
        isCollapsible={isCollapsible}
        defaultExpanded={!isInStatusDisplayMode}
        status={swapStatus}
        receiveAmountInfo={receiveAmountInfo}
        sellCurrencyAmount={sellAmount}
        buyCurrencyAmount={swapExpectedToReceive}
        sourceChainName={sourceChainData.chainName}
        networkCostUsdInfo={networkCostUsdInfo}
        swapExpectedToReceiveAmount={swapExpectedToReceive}
        swapExpectedReceiveUsdInfo={swapExpectedReceiveUsdInfo}
        swapSlippage={swapSlippage}
        swapMinReceiveAmount={buyAmount}
        swapMinReceiveUsdInfo={swapMinReceiveUsdInfo}
        tokenLogoSize={tokenLogoSize}
        bridgeProvider={bridgeProvider}
        recipient={bridgeQuote.bridgeCallDetails.preAuthorizedBridgingHook.recipient}
        sourceChainId={sourceChainData.chainId}
        winningSolver={winningSolverForSwapDetails}
        receivedAmount={receivedAmount}
        receivedAmountUsdInfo={receivedAmountUsdInfo}
        surplusAmount={surplusAmount}
        surplusAmountUsdInfo={surplusAmountUsdInfo}
        swapExplorerUrl={swapExplorerUrl}
      />

      <DividerHorizontal
        margin="8px 0 4px"
        overrideColor={hasBackground ? `var(${UI.COLOR_PAPER_DARKEST})` : undefined}
      />

      <BridgeStopDetails
        isCollapsible={isCollapsible}
        defaultExpanded={true}
        status={bridgeStatus}
        bridgeProvider={bridgeProvider}
        bridgeSendCurrencyAmount={intermediateBuyAmount}
        bridgeReceiveCurrencyAmount={bridgeReceiveCurrencyAmount}
        recipientChainName={destChainData.chainName}
        hideBridgeFlowFiatAmount={hideBridgeFlowFiatAmount}
        receiveAmountUsd={bridgeReceiveAmountUsd}
        bridgeFee={bridgeFee}
        maxBridgeSlippage={maxBridgeSlippage}
        estimatedTime={bridgeQuote.expectedFillTimeSeconds}
        recipient={recipient || account}
        recipientChainId={destChainData.chainId}
        tokenLogoSize={tokenLogoSize}
        bridgeExplorerUrl={bridgeExplorerUrl}
      />
    </Wrapper>
  )
}
