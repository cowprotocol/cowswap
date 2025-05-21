import { ReactNode } from 'react'

import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { useWalletDetails } from '@cowprotocol/wallet'

import { BridgeAccordionSummary, BridgeRouteBreakdown } from 'modules/bridge'
import { useIsCurrentTradeBridging, useIsHooksTradeType, useReceiveAmountInfo } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { TradeRateDetails } from 'modules/tradeWidgetAddons'

import { RateInfoParams } from 'common/pure/RateInfo'

export interface SwapRateDetailsProps {
  rateInfoParams: RateInfoParams
  deadline: number
}

export function SwapRateDetails({ rateInfoParams, deadline }: SwapRateDetailsProps) {
  const { isLoading: isRateLoading, bridgeQuote } = useTradeQuote()

  const isHooksTabEnabled = useIsHooksTradeType()
  const { isSmartContractWallet } = useWalletDetails()
  const receiveAmountInfo = useReceiveAmountInfo()

  const isBridgingEnabled = useIsBridgingEnabled(isSmartContractWallet)
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const shouldDisplayBridgeDetails = isBridgingEnabled && isCurrentTradeBridging && !isHooksTabEnabled

  const providerDetails = bridgeQuote?.providerInfo
  const bridgeEstimatedTime = bridgeQuote?.expectedFillTimeSeconds

  return (
    <TradeRateDetails
      isTradePriceUpdating={isRateLoading}
      rateInfoParams={rateInfoParams}
      deadline={deadline}
      accordionContent={
        shouldDisplayBridgeDetails &&
        receiveAmountInfo &&
        bridgeQuote && <BridgeRouteBreakdown receiveAmountInfo={receiveAmountInfo} bridgeQuote={bridgeQuote} />
      }
      feeWrapper={
        shouldDisplayBridgeDetails && providerDetails
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
