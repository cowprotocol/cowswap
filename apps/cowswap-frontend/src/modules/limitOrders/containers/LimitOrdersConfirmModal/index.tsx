import { useAtom, useAtomValue } from 'jotai'
import React, { useMemo } from 'react'

import { getWrappedToken, getCurrencyAddress } from '@cowprotocol/common-utils'
import { TokenSymbol } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions } from 'modules/trade'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { LOW_RATE_THRESHOLD_PERCENT } from '../../const/trade'
import { LimitOrdersDetails } from '../../pure/LimitOrdersDetails'
import { TradeFlowContext } from '../../services/types'
import { TradeRateDetails } from '../TradeRateDetails'

const CONFIRM_TITLE = 'Limit Order'

export interface LimitOrdersConfirmModalProps {
  tradeContext: TradeFlowContext
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-lines-per-function
export function LimitOrdersConfirmModal(props: LimitOrdersConfirmModalProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, tradeContext: tradeContextInitial, priceImpact, recipient } = props

  /**
   * This is a very important part of the code.
   * After the confirmation modal opens, the trade context should not be recreated.
   * In order to prevent this, we use useMemo to keep the trade context the same when the modal was opened.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tradeContext = useMemo(() => tradeContextInitial, [])

  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const warningsAccepted = useLimitOrdersWarningsAccepted(true)
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const executionPrice = useAtomValue(executionPriceAtom)
  const limitRateState = useAtomValue(limitRateAtom)
  const partiallyFillableOverride = useAtom(partiallyFillableOverrideAtom)

  const { amount: inputAmount } = inputCurrencyInfo
  const { amount: outputAmount } = outputCurrencyInfo

  const rateImpact = useRateImpact()
  const rateInfoParams = useRateInfoParams(inputAmount, outputAmount)

  const tradeConfirmActions = useTradeConfirmActions()

  const doTrade = useHandleOrderPlacement(tradeContext, priceImpact, settingsState, tradeConfirmActions)
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT
  const isConfirmDisabled = isTooLowRate ? !warningsAccepted : false

  const isSafeApprovalBundle = useIsSafeApprovalBundle(inputAmount)
  const buttonText = isSafeApprovalBundle ? (
    <>
      Confirm (Approve&nbsp;
      <TokenSymbol token={inputAmount && getWrappedToken(inputAmount.currency)} length={6} />
      &nbsp;& Limit order)
    </>
  ) : (
    'Place limit order'
  )

  // Generate analytics data for limit order placement
  const placeLimitOrderEvent = useMemo(() => {
    // Relax gating: allow event even if executionPrice is not yet available
    if (!inputAmount || !outputAmount || !limitRateState.activeRate) return undefined

    const inputToken = inputAmount.currency
    const outputToken = outputAmount.currency
    const side = limitRateState.isInverted ? 'sell' : 'buy'

    return toCowSwapGtmEvent({
      category: CowSwapAnalyticsCategory.LIMIT_ORDER_SETTINGS,
      action: 'place_limit_order',
      label: `TokenIn: ${inputToken.symbol || ''}, TokenOut: ${outputToken.symbol || ''}, Side: ${side}, Price: ${executionPrice ? executionPrice.toSignificant(6) : ''}, Amount: ${inputAmount.toSignificant(6)}, PartialFills: ${settingsState.partialFillsEnabled}`,
      sell_token: getCurrencyAddress(inputToken),
      sell_token_symbol: inputToken.symbol || '',
      sell_token_chain_id: inputToken.chainId,
      sell_amount: inputAmount.quotient.toString(),
      sell_amount_human: inputAmount.toSignificant(6),
      buy_token: getCurrencyAddress(outputToken),
      buy_token_symbol: outputToken.symbol || '',
      buy_token_chain_id: outputToken.chainId,
      buy_amount_expected: outputAmount.quotient.toString(),
      buy_amount_human: outputAmount.toSignificant(6),
      side,
      ...(executionPrice && { execution_price: executionPrice.toSignificant(6) }),
    })
  }, [inputAmount, outputAmount, executionPrice, limitRateState, settingsState])

  return (
    <TradeConfirmModal title={CONFIRM_TITLE}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        ensName={ensName}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={isConfirmDisabled}
        priceImpact={priceImpact}
        buttonText={buttonText}
        recipient={recipient}
        appData={tradeContext.postOrderParams.appData || undefined}
        isPriceStatic
        data-click-event={placeLimitOrderEvent}
      >
        {(restContent) => (
          <>
            {tradeContext && (
              <LimitOrdersDetails
                limitRateState={limitRateState}
                tradeContext={tradeContext}
                rateInfoParams={rateInfoParams}
                settingsState={settingsState}
                executionPrice={executionPrice}
                partiallyFillableOverride={partiallyFillableOverride}
              >
                <TradeRateDetails />
              </LimitOrdersDetails>
            )}
            {restContent}
            <LimitOrdersWarnings isConfirmScreen={true} />
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
