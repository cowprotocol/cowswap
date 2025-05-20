import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { useWalletDetails } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { BridgeAccordionSummary, BridgeData, BridgeProtocolConfig, BridgeRouteBreakdown } from 'modules/bridge'
import { useIsCurrentTradeBridging, useIsHooksTradeType } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { TradeRateDetails } from 'modules/tradeWidgetAddons'

import { RateInfoParams } from 'common/pure/RateInfo'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'

export interface SwapRateDetailsProps {
  rateInfoParams: RateInfoParams
  deadline: number
}

export function SwapRateDetails({ rateInfoParams, deadline }: SwapRateDetailsProps) {
  const { isLoading: isRateLoading } = useTradeQuote()

  const { inputCurrencyAmount, outputCurrencyAmount } = useSwapDerivedState()

  const isHooksTabEnabled = useIsHooksTradeType()
  const { isSmartContractWallet } = useWalletDetails()

  const isBridgingEnabled = useIsBridgingEnabled(isSmartContractWallet)
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const shouldDisplayBridgeDetails = isBridgingEnabled && isCurrentTradeBridging && !isHooksTabEnabled

  // TODO: bridgeDetailsUI: Set a real value for bridgeData based on bridging logic
  const bridgeData = null as BridgeData | null
  const providerDetails: BridgeProtocolConfig | undefined = bridgeData?.bridgeProvider
  const bridgeEstimatedTime: number | undefined = bridgeData?.estimatedTime

  return (
    <TradeRateDetails
      isTradePriceUpdating={isRateLoading}
      rateInfoParams={rateInfoParams}
      deadline={deadline}
      accordionContent={
        shouldDisplayBridgeDetails &&
        bridgeData && (
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
        )
      }
      feeWrapper={
        shouldDisplayBridgeDetails && bridgeData
          ? (feeElement: ReactNode) => (
              <BridgeAccordionSummary bridgeEstimatedTime={bridgeEstimatedTime} bridgeProtocol={providerDetails}>
                {feeElement}
              </BridgeAccordionSummary>
            )
          : undefined
      }
    />
  )
}
