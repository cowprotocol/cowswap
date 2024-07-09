import React, { useMemo, useState } from 'react'

import { getMinimumReceivedTooltip } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { Percent, TradeType } from '@uniswap/sdk-core'

import { HighFeeWarning } from 'legacy/components/SwapWarnings'
import { getActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { createActivityDescriptor } from 'legacy/hooks/useRecentActivity'
import { Order } from 'legacy/state/orders/actions'
import TradeGp from 'legacy/state/swap/TradeGp'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { TradeConfirmation, TradeConfirmModal, useReceiveAmountInfo, useTradeConfirmActions } from 'modules/trade'
import { TradeBasicConfirmDetails } from 'modules/trade/containers/TradeBasicConfirmDetails'
import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'
import { RateInfoParams } from 'common/pure/RateInfo'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useIsEoaEthFlow } from '../../hooks/useIsEoaEthFlow'
import { useShouldPayGas } from '../../hooks/useShouldPayGas'
import { useSwapConfirmButtonText } from '../../hooks/useSwapConfirmButtonText'
import { useSwapState } from '../../hooks/useSwapState'
import { NetworkCostsTooltipSuffix } from '../../pure/NetworkCostsTooltipSuffix'
import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from '../../pure/Row/RowSlippageContent'
import { RowDeadline } from '../Row/RowDeadline'

const CONFIRM_TITLE = 'Swap'

export interface ConfirmSwapModalSetupProps {
  chainId: SupportedChainId
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  rateInfoParams: RateInfoParams
  refreshInterval: number
  allowedSlippage: Percent
  trade: TradeGp | undefined

  doTrade(): void
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const {
    chainId,
    inputCurrencyInfo,
    outputCurrencyInfo,
    doTrade,
    priceImpact,
    allowedSlippage,
    trade,
    refreshInterval,
    rateInfoParams,
  } = props

  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const { recipient } = useSwapState()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const receiveAmountInfo = useReceiveAmountInfo()
  const widgetParams = useInjectedWidgetParams()
  const shouldPayGas = useShouldPayGas()
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()

  const isInvertedState = useState(false)

  const slippageAdjustedSellAmount = trade?.maximumAmountIn(allowedSlippage)
  const isExactIn = trade?.tradeType === TradeType.EXACT_INPUT

  const buttonText = useSwapConfirmButtonText(slippageAdjustedSellAmount)

  const labelsAndTooltips = useMemo(
    () => ({
      slippageLabel: isEoaEthFlow ? 'Slippage tolerance (modified)' : undefined,
      slippageTooltip: isEoaEthFlow
        ? getNativeSlippageTooltip(chainId, [nativeCurrency.symbol])
        : getNonNativeSlippageTooltip(),
      expectReceiveLabel: isExactIn ? 'Expected to receive' : 'Expected to sell',
      minReceivedLabel: isExactIn ? 'Minimum receive' : 'Maximum sent',
      minReceivedTooltip: getMinimumReceivedTooltip(allowedSlippage, isExactIn),
      networkCostsSuffix: shouldPayGas ? <NetworkCostsSuffix /> : null,
      networkCostsTooltipSuffix: <NetworkCostsTooltipSuffix />,
    }),
    [chainId, allowedSlippage, nativeCurrency.symbol, isEoaEthFlow, isExactIn, shouldPayGas]
  )

  const submittedContent = (order: Order | undefined, onDismiss: Command) => {
    const activity = createActivityDescriptor(chainId, undefined, order)
    const activityDerivedState = getActivityDerivedState({ chainId, activityData: activity, gnosisSafeInfo })

    return (
      <TransactionSubmittedContent
        chainId={chainId}
        hash={order?.id}
        onDismiss={onDismiss}
        activityDerivedState={activityDerivedState}
      />
    )
  }

  return (
    <TradeConfirmModal title={CONFIRM_TITLE} submittedContent={submittedContent}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        ensName={ensName}
        refreshInterval={refreshInterval}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={false}
        priceImpact={priceImpact}
        buttonText={buttonText}
        recipient={recipient}
      >
        <>
          {receiveAmountInfo && (
            <TradeBasicConfirmDetails
              isInvertedState={isInvertedState}
              rateInfoParams={rateInfoParams}
              slippage={allowedSlippage}
              receiveAmountInfo={receiveAmountInfo}
              widgetParams={widgetParams}
              labelsAndTooltips={labelsAndTooltips}
              recipient={recipient}
              account={account}
              hideLimitPrice
              hideUsdValues
              withTimelineDot={false}
              alwaysRow
            >
              <RowDeadline />
            </TradeBasicConfirmDetails>
          )}
          <HighFeeWarning trade={trade} />
          {!priceImpact.priceImpact && <NoImpactWarning isAccepted withoutAccepting />}
        </>
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
