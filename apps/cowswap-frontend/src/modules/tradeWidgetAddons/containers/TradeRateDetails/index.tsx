import { useMemo, useState, useCallback, ReactElement } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { useWalletDetails } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { BridgeData, BridgeRouteBreakdown, BridgeProtocolConfig } from 'modules/bridge'
import {
  getTotalCosts,
  TradeFeesAndCosts,
  TradeTotalCostsDetails,
  useDerivedTradeState,
  NetworkCostsRow,
  useReceiveAmountInfo,
  useShouldPayGas,
  useIsHooksTradeType,
  useIsCurrentTradeBridging,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useIsSlippageModified, useTradeSlippage } from 'modules/tradeSlippage'
import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFeeTooltip } from 'modules/volumeFee'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'
import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'
import { RateInfoParams } from 'common/pure/RateInfo'

import { NetworkCostsTooltipSuffix } from '../../pure/NetworkCostsTooltipSuffix'
import { RowDeadline } from '../RowDeadline'
import { RowSlippage } from '../RowSlippage'

interface TradeRateDetailsProps {
  deadline: number
  rateInfoParams: RateInfoParams
  children?: ReactElement
  isTradePriceUpdating: boolean
}

export function TradeRateDetails({ rateInfoParams, deadline, isTradePriceUpdating }: TradeRateDetailsProps) {
  const [isFeeDetailsOpen, setFeeDetailsOpen] = useState(false)

  const slippage = useTradeSlippage()
  const isSlippageModified = useIsSlippageModified()
  const receiveAmountInfo = useReceiveAmountInfo()
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const shouldPayGas = useShouldPayGas()
  const isHooksTabEnabled = useIsHooksTradeType()
  const { isSmartContractWallet } = useWalletDetails()

  // Bridge related state
  const isBridgingEnabled = useIsBridgingEnabled(isSmartContractWallet)
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const showBridgeUI = isBridgingEnabled && isCurrentTradeBridging
  // TODO: bridgeDetailsUI: Set a real value for bridgeData based on bridging logic
  const bridgeData = null as BridgeData | null
  const providerDetails: BridgeProtocolConfig | undefined = bridgeData?.bridgeProvider
  const bridgeEstimatedTime: number | undefined = bridgeData?.estimatedTime

  const inputCurrency = derivedTradeState?.inputCurrency
  const outputCurrency = derivedTradeState?.outputCurrency
  const inputCurrencyAmount = derivedTradeState?.inputCurrencyAmount
  const outputCurrencyAmount = derivedTradeState?.outputCurrencyAmount

  const costsExceedFeeRaw = tradeQuote.error instanceof QuoteApiError ? tradeQuote?.error?.data?.fee_amount : undefined

  const networkFeeAmount = useMemo(() => {
    if (!costsExceedFeeRaw || !inputCurrency) return null
    return CurrencyAmount.fromRawAmount(inputCurrency, costsExceedFeeRaw)
  }, [costsExceedFeeRaw, inputCurrency])

  const volumeFeeTooltip = useVolumeFeeTooltip()
  const networkFeeAmountUsd = useUsdAmount(networkFeeAmount).value

  const toggleAccordion = useCallback(() => {
    setFeeDetailsOpen((prev) => !prev)
  }, [])

  if (!receiveAmountInfo) {
    if (!networkFeeAmount) return null

    return (
      <div style={{ padding: '0 10px' }}>
        <NetworkCostsRow
          networkFeeAmount={networkFeeAmount}
          networkFeeAmountUsd={networkFeeAmountUsd}
          withTimelineDot={false}
          amountSuffix={shouldPayGas ? <NetworkCostsSuffix /> : null}
          tooltipSuffix={<NetworkCostsTooltipSuffix />}
        />
      </div>
    )
  }

  const totalCosts = getTotalCosts(receiveAmountInfo)

  const shouldRenderBridgeUI = !!(
    showBridgeUI &&
    bridgeData &&
    !isHooksTabEnabled &&
    inputCurrency &&
    outputCurrency &&
    inputCurrencyAmount &&
    outputCurrencyAmount &&
    'sellAmount' in bridgeData &&
    'buyAmount' in bridgeData
  )

  const accordionContent = shouldRenderBridgeUI ? (
    <BridgeRouteBreakdown
      sellCurrencyAmount={inputCurrencyAmount as CurrencyAmount<TokenWithLogo>}
      buyCurrencyAmount={outputCurrencyAmount as CurrencyAmount<TokenWithLogo>}
      bridgeSendCurrencyAmount={inputCurrencyAmount as CurrencyAmount<TokenWithLogo>}
      bridgeReceiveCurrencyAmount={outputCurrencyAmount as CurrencyAmount<TokenWithLogo>}
      networkCost={bridgeData.networkCost}
      swapMinReceive={bridgeData.swapMinReceive}
      swapExpectedToReceive={bridgeData.swapExpectedToReceive}
      swapMaxSlippage={bridgeData.swapMaxSlippage}
      bridgeFee={bridgeData.bridgeFee}
      maxBridgeSlippage={bridgeData.maxBridgeSlippage}
      estimatedTime={bridgeData.estimatedTime}
      recipient={bridgeData.recipient}
      bridgeProvider={bridgeData.bridgeProvider}
    />
  ) : (
    <>
      <TradeFeesAndCosts
        receiveAmountInfo={receiveAmountInfo}
        withTimelineDot={false}
        networkCostsSuffix={shouldPayGas ? <NetworkCostsSuffix /> : null}
        networkCostsTooltipSuffix={<NetworkCostsTooltipSuffix />}
        volumeFeeTooltip={volumeFeeTooltip}
      />
      {slippage && (
        <RowSlippage
          isTradePriceUpdating={isTradePriceUpdating}
          allowedSlippage={slippage}
          isSlippageModified={isSlippageModified}
        />
      )}
      <RowDeadline deadline={deadline} />
    </>
  )

  return (
    <TradeTotalCostsDetails
      totalCosts={totalCosts}
      rateInfoParams={rateInfoParams}
      isFeeDetailsOpen={isFeeDetailsOpen}
      toggleAccordion={toggleAccordion}
      bridgeEstimatedTime={bridgeEstimatedTime}
      bridgeProtocol={providerDetails}
      showBridgeUI={shouldRenderBridgeUI}
    >
      {accordionContent}
    </TradeTotalCostsDetails>
  )
}
