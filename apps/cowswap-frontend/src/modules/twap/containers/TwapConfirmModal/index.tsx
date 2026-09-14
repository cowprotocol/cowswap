import { ReactNode } from 'react'

import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import {
  TradeConfirmation,
  TradeConfirmModal,
  useCommonTradeConfirmContext,
  useFreezeWhileConfirming,
  useTradePriceImpact,
} from 'modules/trade'

import { TwapBadge, TwapTradeConfirmationDetails } from './TwapConfirmModal.styled'
import { useEoaTwapPlan } from './useEoaTwapPlan'
import { useTwapConfirmCurrencyPreview } from './useTwapConfirmCurrencyPreview'

import { useCreateTwapOrder } from '../../hooks/useCreateTwapOrder'
import { useIsFallbackHandlerRequired } from '../../hooks/useFallbackHandlerVerification'
import { useTwapOrder } from '../../hooks/useTwapOrder'
import { useTwapSlippage } from '../../hooks/useTwapSlippage'
import { EoaTwapSigningPendingContent } from '../EoaTwapSigningPendingContent/EoaTwapSigningPendingContent'
import { TwapFormWarnings } from '../TwapFormWarnings'

export function TwapConfirmModal(): ReactNode {
  const { account } = useWalletInfo()
  const commonTradeConfirmContext = useCommonTradeConfirmContext()
  const { recipient, recipientAddress } = useAdvancedOrdersDerivedState()
  const twapOrder = useTwapOrder()
  const slippage = useTwapSlippage()
  const createTwapOrder = useCreateTwapOrder()
  const priceImpact = useTradePriceImpact()
  const fallbackHandlerIsNotSet = useIsFallbackHandlerRequired()

  const { timeInterval, numOfParts } = twapOrder || {}
  const partDuration = timeInterval
  const totalDuration = timeInterval && numOfParts ? timeInterval * numOfParts : undefined

  const {
    inputCurrencyInfo,
    inputSymbolLabel,
    isConfirmDisabled,
    isInsufficientBalance,
    localFormValidation,
    outputCurrencyInfo,
    rateInfoParams,
    receiveAmountInfo,
  } = useTwapConfirmCurrencyPreview()

  // Freeze every quote-derived value shown in the review screen once the user clicks confirm, so
  // the modal can never display a different amount than what was actually confirmed/signed.
  const {
    receiveAmountInfo: frozenReceiveAmountInfo,
    rateInfoParams: frozenRateInfoParams,
    slippage: frozenSlippage,
  } = useFreezeWhileConfirming({ receiveAmountInfo, rateInfoParams, slippage })

  const { badgeProps, buttonProps, hasSigningPlan, isEoaTwapSuccess, onDismiss, steps } = useEoaTwapPlan({
    inputToken: inputCurrencyInfo.amount?.currency,
    inputSymbolLabel,
  })

  const eoaTwapSigningStepElement =
    steps || isEoaTwapSuccess ? (
      <EoaTwapSigningPendingContent steps={steps ?? []} buttonProps={buttonProps} onDismiss={onDismiss} />
    ) : null

  const titleBadgeElement = badgeProps ? <TwapBadge {...badgeProps} /> : null
  const titleElement = hasSigningPlan ? (
    <>
      {t`TWAP order`} {titleBadgeElement}
    </>
  ) : (
    t`Review TWAP`
  )

  const tradeDetailsElement =
    frozenReceiveAmountInfo && numOfParts ? (
      <TwapTradeConfirmationDetails
        rateInfoParams={frozenRateInfoParams}
        receiveAmountInfo={frozenReceiveAmountInfo}
        slippage={frozenSlippage}
        recipient={recipient}
        recipientAddress={recipientAddress}
        account={account}
        startTime={twapOrder?.startTime}
        numOfParts={numOfParts}
        partDuration={partDuration}
        totalDuration={totalDuration}
        isCollapsible={hasSigningPlan}
      />
    ) : null

  const twapFormWarningsElement = isEoaTwapSuccess ? null : (
    <TwapFormWarnings localFormValidation={localFormValidation} isConfirmationModal />
  )

  return (
    <TradeConfirmModal orderType={UiOrderType.TWAP} showGetNotifiedMessage>
      <TradeConfirmation
        {...commonTradeConfirmContext}
        title={titleElement}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={() => createTwapOrder(fallbackHandlerIsNotSet)}
        onDismiss={onDismiss}
        isConfirmDisabled={isConfirmDisabled}
        priceImpact={priceImpact}
        buttonText={isInsufficientBalance ? t`Insufficient ${inputSymbolLabel} balance` : t`Place TWAP order`}
        recipient={recipient}
        hasSigningPlan={hasSigningPlan}
      >
        {(restContent) => (
          <>
            {tradeDetailsElement}
            {isEoaTwapSuccess ? null : restContent}
            {twapFormWarningsElement}
            {eoaTwapSigningStepElement}
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
