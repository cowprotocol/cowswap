import React, { useMemo, useState } from 'react'

import { INPUT_OUTPUT_EXPLANATION } from '@cowprotocol/common-const'
import { getMinimumReceivedTooltip } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { TradeType } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { HighFeeWarning } from 'legacy/components/SwapWarnings'
import { getActivityDerivedState } from 'legacy/hooks/useActivityDerivedState'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { createActivityDescriptor } from 'legacy/hooks/useRecentActivity'
import { Order } from 'legacy/state/orders/actions'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { TradeConfirmation, TradeConfirmModal, useReceiveAmountInfo, useTradeConfirmActions } from 'modules/trade'
import { TradeBasicConfirmDetails } from 'modules/trade/containers/TradeBasicConfirmDetails'
import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'

import { useSwapConfirmButtonText } from '../../hooks/useSwapConfirmButtonText'
import { useSwapState } from '../../hooks/useSwapState'
import { TradeRatesProps } from '../../pure/TradeRates'

const CONFIRM_TITLE = 'Swap'

export interface ConfirmSwapModalSetupProps {
  chainId: SupportedChainId
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  tradeRatesProps: TradeRatesProps
  refreshInterval: number

  doTrade(): void
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const { chainId, inputCurrencyInfo, outputCurrencyInfo, doTrade, priceImpact, tradeRatesProps, refreshInterval } =
    props

  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const { recipient } = useSwapState()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const receiveAmountInfo = useReceiveAmountInfo()
  const widgetParams = useInjectedWidgetParams()

  const isInvertedState = useState(false)

  const { allowedSlippage, trade } = tradeRatesProps
  const slippageAdjustedSellAmount = trade?.maximumAmountIn(allowedSlippage)
  const isExactIn = trade?.tradeType === TradeType.EXACT_INPUT

  const buttonText = useSwapConfirmButtonText(slippageAdjustedSellAmount)

  const labelsAndTooltips = useMemo(
    () => ({
      slippageTooltip: (
        <Trans>
          Your slippage is MEV protected: all orders are submitted with tight spread (0.1%) on-chain.
          <br />
          <br />
          The slippage you pick here enables a resubmission of your order in case of unfavourable price movements.
          <br />
          <br />
          {INPUT_OUTPUT_EXPLANATION}
        </Trans>
      ),
      minReceivedLabel: 'Minimum receive',
      minReceivedTooltip: getMinimumReceivedTooltip(allowedSlippage, isExactIn),
    }),
    [allowedSlippage]
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
              rateInfoParams={tradeRatesProps.rateInfoParams}
              slippage={allowedSlippage}
              receiveAmountInfo={receiveAmountInfo}
              widgetParams={widgetParams}
              labelsAndTooltips={labelsAndTooltips}
              hideLimitPrice
              hideUsdValues
              withTimelineDot={false}
            />
          )}
          <HighFeeWarning trade={tradeRatesProps.trade} />
          {!priceImpact.priceImpact && <NoImpactWarning isAccepted withoutAccepting />}
        </>
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
