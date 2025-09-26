import { ReactNode, useMemo } from 'react'

import type { BridgeProviderInfo } from '@cowprotocol/sdk-bridging'
import { Nullish } from '@cowprotocol/types'
import { Percent } from '@uniswap/sdk-core'

import { QuoteDetails, useQuoteBridgeContext, useQuoteSwapContext } from 'modules/bridge'
import { TradeBasicConfirmDetails, useGetReceiveAmountInfo } from 'modules/trade'
import { RowDeadline } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { RateInfo } from 'common/pure/RateInfo'

import { useLabelsAndTooltips } from './useLabelsAndTooltips'

type BridgeBeforeProps = {
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  bridgeProvider: BridgeProviderInfo
  swapContext: NonNullable<ReturnType<typeof useQuoteSwapContext>>
  bridgeContext: NonNullable<ReturnType<typeof useQuoteBridgeContext>>
}

function BridgeBeforeContent({
  rateInfoParams,
  bridgeProvider,
  swapContext,
  bridgeContext,
}: BridgeBeforeProps): ReactNode {
  return (
    <>
      <RateInfo label="Price" rateInfoParams={rateInfoParams} fontSize={13} fontBold labelBold />
      <QuoteDetails
        isCollapsible
        bridgeProvider={bridgeProvider}
        swapContext={swapContext}
        bridgeContext={bridgeContext}
        hideRecommendedSlippage
      />
    </>
  )
}

type DefaultBeforeProps = {
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  slippage: Percent | null
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
  account: string | undefined
  labelsAndTooltips: ReturnType<typeof useLabelsAndTooltips>
  deadline: number
}

function DefaultBeforeContent(props: DefaultBeforeProps): ReactNode {
  const {
    rateInfoParams,
    slippage,
    receiveAmountInfo,
    recipient,
    recipientAddress,
    account,
    labelsAndTooltips,
    deadline,
  } = props

  if (!receiveAmountInfo || !slippage) return null

  return (
    <TradeBasicConfirmDetails
      rateInfoParams={rateInfoParams}
      slippage={slippage}
      receiveAmountInfo={receiveAmountInfo}
      recipient={recipient}
      recipientAddress={recipientAddress}
      account={account}
      labelsAndTooltips={labelsAndTooltips}
      hideLimitPrice
      hideUsdValues
      withTimelineDot={false}
    >
      <RowDeadline deadline={deadline} />
    </TradeBasicConfirmDetails>
  )
}

export type BeforeContentParams = {
  shouldDisplayBridgeDetails: boolean
  bridgeProvider?: BridgeProviderInfo
  swapContext: ReturnType<typeof useQuoteSwapContext>
  bridgeContext: ReturnType<typeof useQuoteBridgeContext>
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
  slippage: Percent | null
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
  account: string | undefined
  labelsAndTooltips: ReturnType<typeof useLabelsAndTooltips>
  deadline: number
}

export function useBeforeContent(params: BeforeContentParams): ReactNode {
  const {
    shouldDisplayBridgeDetails,
    bridgeProvider,
    swapContext,
    bridgeContext,
    rateInfoParams,
    receiveAmountInfo,
    slippage,
    recipient,
    recipientAddress,
    account,
    labelsAndTooltips,
    deadline,
  } = params

  return useMemo(() => {
    return shouldDisplayBridgeDetails && bridgeProvider && swapContext && bridgeContext ? (
      <BridgeBeforeContent
        rateInfoParams={rateInfoParams}
        bridgeProvider={bridgeProvider}
        swapContext={swapContext}
        bridgeContext={bridgeContext}
      />
    ) : receiveAmountInfo && slippage ? (
      <DefaultBeforeContent
        rateInfoParams={rateInfoParams}
        slippage={slippage}
        receiveAmountInfo={receiveAmountInfo}
        recipient={recipient}
        recipientAddress={recipientAddress}
        account={account}
        labelsAndTooltips={labelsAndTooltips}
        deadline={deadline}
      />
    ) : null
  }, [
    shouldDisplayBridgeDetails,
    bridgeProvider,
    swapContext,
    bridgeContext,
    rateInfoParams,
    receiveAmountInfo,
    slippage,
    recipient,
    recipientAddress,
    account,
    labelsAndTooltips,
    deadline,
  ])
}
