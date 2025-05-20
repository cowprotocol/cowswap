import { ReactNode } from 'react'

import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { useWalletDetails } from '@cowprotocol/wallet'

import { BridgeAccordionSummary, BridgeProtocolConfig, BridgeRouteBreakdown } from 'modules/bridge'
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

  const isBridgingEnabled = useIsBridgingEnabled(isSmartContractWallet)
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const shouldDisplayBridgeDetails = isBridgingEnabled && isCurrentTradeBridging && !isHooksTabEnabled

  const providerDetails: BridgeProtocolConfig | undefined = bridgeQuote
    ? {
        icon: bridgeQuote.providerInfo.logoUrl,
        title: bridgeQuote.providerInfo.name,
        url: 'TODO PROVIDER URL',
        description: 'TODO PROVIDER DESC',
      }
    : undefined
  const bridgeEstimatedTime = bridgeQuote?.expectedFillTimeSeconds

  const receiveAmountInfo = useReceiveAmountInfo()

  return (
    <TradeRateDetails
      isTradePriceUpdating={isRateLoading}
      rateInfoParams={rateInfoParams}
      deadline={deadline}
      accordionContent={
        shouldDisplayBridgeDetails &&
        receiveAmountInfo &&
        bridgeQuote &&
        providerDetails && (
          <BridgeRouteBreakdown
            receiveAmountInfo={receiveAmountInfo}
            bridgeQuote={bridgeQuote}
            bridgeProvider={providerDetails}
          />
        )
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
