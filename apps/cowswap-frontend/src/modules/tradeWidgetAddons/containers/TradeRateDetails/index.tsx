import { useMemo, useState, useCallback, ReactElement } from 'react'

// TODO(bridge): Import the bridge hooks and state from the bridge module once the bridge is implemented
// import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
// import { useWalletDetails } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { BridgeProvider, BridgeRouteBreakdown, createBridgeData, useBridgeProviderDetails } from 'modules/bridge'
import {
  getTotalCosts,
  TradeFeesAndCosts,
  TradeTotalCostsDetails,
  useDerivedTradeState,
  NetworkCostsRow,
  useReceiveAmountInfo,
  useShouldPayGas,
  useIsHooksTradeType,
} from 'modules/trade'
// TODO(bridge): Import the isCurrentTradeBridging hook from the bridge module once the bridge is implemented
// import { useIsCurrentTradeBridging } from 'modules/trade/hooks/useIsCurrentTradeBridging'
import { useTradeQuote } from 'modules/tradeQuote'
import { useIsSlippageModified, useTradeSlippage } from 'modules/tradeSlippage'
import { useUsdAmount } from 'modules/usdAmount'
import { useVolumeFeeTooltip } from 'modules/volumeFee'

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

// TODO(bridge): Generates a random bridge transaction time estimate between 2-15 minutes
// In the final implementation, this should be replaced with actual time calculations from bridge providers
const getBridgeEstimatedMinutes = () => Math.floor(Math.random() * (15 - 2 + 1)) + 2

export function TradeRateDetails({ rateInfoParams, deadline, isTradePriceUpdating }: TradeRateDetailsProps) {
  const [isFeeDetailsOpen, setFeeDetailsOpen] = useState(false)

  const slippage = useTradeSlippage()
  const isSlippageModified = useIsSlippageModified()
  const receiveAmountInfo = useReceiveAmountInfo()
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const shouldPayGas = useShouldPayGas()
  // const { isSmartContractWallet } = useWalletDetails()

  // TODO(bridge): Bridge-related hooks and state
  // TODO(bridge): Use the bridge hooks and state from the bridge module once the bridge is implemented
  // const _isBridgingEnabled = useIsBridgingEnabled(isSmartContractWallet)
  const isHooksTabEnabled = useIsHooksTradeType()

  // TODO(bridge): For now, force showBridgeUI to true for demo purposes.
  // In production, this should be: const showBridgeUI = _isBridgingEnabled && _isCurrentTradeBridging
  const showBridgeUI = true

  // TODO(bridge): Use default bridge provider for now - can be made configurable later
  const bridgeProvider = BridgeProvider.BUNGEE
  const providerDetails = useBridgeProviderDetails(bridgeProvider)

  // Create example bridge data using the provider details
  const bridgeData = useMemo(() => {
    if (!showBridgeUI) return null

    try {
      const data = createBridgeData({
        bridgeProvider: providerDetails,
        estimatedTime: getBridgeEstimatedMinutes(),
      })

      return data
    } catch (error) {
      console.error('Failed to create bridge data:', error)
      // In case of error, return null to fall back to regular trade UI
      return null
    }
  }, [providerDetails, showBridgeUI])

  // Get bridge time estimate with error handling
  const bridgeEstimatedTime = useMemo(
    () => (showBridgeUI && bridgeData ? bridgeData.estimatedTime : undefined),
    [showBridgeUI, bridgeData],
  )

  const inputCurrency = derivedTradeState?.inputCurrency
  const costsExceedFeeRaw = tradeQuote?.error?.data?.fee_amount

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

  // Determine if Bridge UI should be rendered based on additional conditions:
  // 1. Not on the Hooks tab
  // 2. Tokens are on different chains (cross-chain trade)
  const shouldRenderBridgeUI = showBridgeUI && bridgeData && !isHooksTabEnabled

  const accordionContent = shouldRenderBridgeUI ? (
    <BridgeRouteBreakdown {...bridgeData} />
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
      showBridgeUI={!!shouldRenderBridgeUI}
    >
      {accordionContent}
    </TradeTotalCostsDetails>
  )
}
