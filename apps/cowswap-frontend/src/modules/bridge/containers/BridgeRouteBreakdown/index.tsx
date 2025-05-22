import { useCallback, ReactNode } from 'react'

import { getChainInfo, TokenWithLogo } from '@cowprotocol/common-const'
import { BridgeQuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { DividerHorizontal } from 'modules/bridge/styles'
import { ReceiveAmountInfo, useDerivedTradeState } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'
import { useUsdAmount } from 'modules/usdAmount'

import { Wrapper } from './styled'

import { useBridgeQuoteAmounts } from '../../hooks/useBridgeQuoteAmounts'
import { useBridgeSupportedNetworks } from '../../hooks/useBridgeSupportedNetworks'
import { useBridgeWinningSolverInfo } from '../../hooks/useBridgeWinningSolverInfo'
import { BridgeStopDetails } from '../../pure/BridgeStopDetails'
import { RouteOverviewTitle } from '../../pure/RouteOverviewTitle'
import { SwapStopDetails } from '../../pure/SwapStopDetails'
import { StopStatusEnum } from '../../utils'

interface BridgeRouteUiParams {
  // Display options
  hideRouteHeader: boolean

  // Overall Accordion functionality
  isCollapsible: boolean
  isExpanded: boolean
  onExpandToggle: () => void
}

interface BridgingRouteResults {
  winningSolverId: string
  receivedAmount: CurrencyAmount<TokenWithLogo> | null
  surplusAmount: CurrencyAmount<TokenWithLogo> | null
  swapExplorerUrl: string
  bridgeExplorerUrl: string
}

export interface BridgeRouteBreakdownProps {
  receiveAmountInfo: ReceiveAmountInfo
  bridgeQuote: BridgeQuoteResults

  bridgeStatus?: StopStatusEnum
  swapStatus?: StopStatusEnum

  uiParams?: Partial<BridgeRouteUiParams>
  bridgingResults?: Partial<BridgingRouteResults>
  collapsedDefault?: ReactNode
}

const defaultBridgeRouteUiParams: BridgeRouteUiParams = {
  hideRouteHeader: false,
  isCollapsible: false,
  isExpanded: true,
  onExpandToggle: () => {},
}

export function BridgeRouteBreakdown({
  receiveAmountInfo,
  bridgeQuote,
  swapStatus,
  bridgeStatus,
  uiParams = defaultBridgeRouteUiParams,
  bridgingResults,
  collapsedDefault,
}: BridgeRouteBreakdownProps) {
  const { account } = useWalletInfo()
  const { recipient } = useDerivedTradeState() || {}
  const swapSlippage = useTradeSlippage()
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()

  const amounts = useBridgeQuoteAmounts(receiveAmountInfo, bridgeQuote)

  const providerDetails = bridgeQuote.providerInfo
  const { sellAmount } = receiveAmountInfo.afterSlippage
  const sellToken = sellAmount.currency

  const sourceChainId = sellToken.chainId as SupportedChainId
  const targetChainId = amounts.swapMinReceiveAmount.currency.chainId

  const sourceChainData = getChainInfo(sourceChainId)
  const destChainData = bridgeSupportedNetworks?.find((chain) => chain.id === targetChainId)

  // Determine if we are in a mode where statuses are actively displayed (like the BridgeStatus fixture)
  // This is true if swapStatus is provided, indicating a status-aware context.
  const isInStatusDisplayMode = typeof swapStatus !== 'undefined'

  const {
    winningSolverId,
    receivedAmount = null,
    surplusAmount = null,
    swapExplorerUrl,
    bridgeExplorerUrl,
  } = bridgingResults || {}

  const winningSolverForSwapDetails = useBridgeWinningSolverInfo(sourceChainId, winningSolverId)

  const swapMinReceiveUsdInfo = useUsdAmount(receiveAmountInfo.afterSlippage.buyAmount)
  const swapExpectedReceiveUsdInfo = useUsdAmount(amounts.swapBuyAmount)

  const { value: bridgeReceiveAmountUsd } = useUsdAmount(amounts.bridgeMinReceiveAmount)
  const rawReceivedAmountUsdInfo = useUsdAmount(receivedAmount)
  const receivedAmountUsdInfo = receivedAmount ? rawReceivedAmountUsdInfo : null
  const rawSurplusAmountUsdInfo = useUsdAmount(surplusAmount)
  const surplusAmountUsdInfo = surplusAmount ? rawSurplusAmountUsdInfo : null

  const handleHeaderClick = useCallback(() => {
    if (uiParams.isCollapsible) {
      uiParams.onExpandToggle?.()
    }
  }, [uiParams])

  const {
    isCollapsible = false,
    isExpanded = defaultBridgeRouteUiParams.isExpanded,
    hideRouteHeader = defaultBridgeRouteUiParams.hideRouteHeader,
  } = uiParams

  const headerContent = (
    <RouteOverviewTitle
      isCollapsible={isCollapsible}
      isExpanded={isExpanded}
      providerInfo={providerDetails}
      onClick={handleHeaderClick}
    />
  )

  if (isCollapsible && !isExpanded) {
    return (
      <Wrapper>
        {!hideRouteHeader && headerContent}
        {collapsedDefault}
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      {!hideRouteHeader && headerContent}

      <SwapStopDetails
        isCollapsible={isCollapsible}
        defaultExpanded={!isInStatusDisplayMode}
        status={swapStatus}
        receiveAmountInfo={receiveAmountInfo}
        sellCurrencyAmount={amounts.swapSellAmount}
        buyCurrencyAmount={amounts.swapBuyAmount}
        sourceChainName={sourceChainData.name}
        swapExpectedReceiveUsdInfo={swapExpectedReceiveUsdInfo}
        swapSlippage={swapSlippage}
        swapMinReceiveAmount={amounts.swapMinReceiveAmount}
        swapMinReceiveUsdInfo={swapMinReceiveUsdInfo}
        bridgeProvider={providerDetails}
        recipient={bridgeQuote.bridgeCallDetails.preAuthorizedBridgingHook.recipient}
        sourceChainId={sourceChainId}
        winningSolver={winningSolverForSwapDetails}
        receivedAmount={receivedAmount}
        receivedAmountUsdInfo={receivedAmountUsdInfo}
        surplusAmount={surplusAmount}
        surplusAmountUsdInfo={surplusAmountUsdInfo}
        swapExplorerUrl={swapExplorerUrl}
      />

      <DividerHorizontal margin="8px 0 4px" />

      <BridgeStopDetails
        isCollapsible={isCollapsible}
        defaultExpanded={true}
        status={bridgeStatus}
        bridgeProvider={providerDetails}
        bridgeSendCurrencyAmount={amounts.swapMinReceiveAmount}
        bridgeReceiveCurrencyAmount={amounts.bridgeMinReceiveAmount}
        recipientChainName={destChainData?.label || 'Unknow network'}
        receiveAmountUsd={bridgeReceiveAmountUsd}
        bridgeFee={amounts.bridgeFee}
        estimatedTime={bridgeQuote.expectedFillTimeSeconds}
        recipient={recipient || account}
        recipientChainId={targetChainId}
        bridgeExplorerUrl={bridgeExplorerUrl}
      />
    </Wrapper>
  )
}
