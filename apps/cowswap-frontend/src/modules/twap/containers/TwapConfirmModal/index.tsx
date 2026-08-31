import { useCallback, ReactNode } from 'react'

import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import styled from 'styled-components/macro'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useHasEnoughBalanceForAmount } from 'modules/combinedBalances'
import {
  TradeConfirmation,
  TradeConfirmModal,
  useCommonTradeConfirmContext,
  useTradeConfirmActions,
  useTradePriceImpact,
} from 'modules/trade'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { TwapTradeConfirmationDetails as TwapTradeConfirmationDetailsBase } from './TwapTradeConfirmationDetails'

import { useCreateTwapOrder } from '../../hooks/useCreateTwapOrder'
import { useEoaTwapFlowUpdater, useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { useIsFallbackHandlerRequired } from '../../hooks/useFallbackHandlerVerification'
import { useScaledReceiveAmountInfo } from '../../hooks/useScaledReceiveAmountInfo'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { useTwapOrder } from '../../hooks/useTwapOrder'
import { useTwapSlippage } from '../../hooks/useTwapSlippage'
import { EoaTwapSigningPendingContent } from '../EoaTwapSigningPendingContent/EoaTwapSigningPendingContent'
import { TwapFormWarnings } from '../TwapFormWarnings'

const TwapTradeConfirmationDetails = styled(TwapTradeConfirmationDetailsBase)`
  margin-top: -4px;
`

export function TwapConfirmModal(): ReactNode {
  const { account } = useWalletInfo()
  const commonTradeConfirmContext = useCommonTradeConfirmContext()
  const {
    inputCurrencyAmount,
    inputCurrencyFiatAmount,
    inputCurrencyBalance,
    outputCurrencyAmount,
    outputCurrencyFiatAmount,
    outputCurrencyBalance,
    recipient,
    recipientAddress,
  } = useAdvancedOrdersDerivedState()
  // TODO: there's some overlap with what's in each hook (useTwapOrder | useScaledReceiveAmountInfo)
  const twapOrder = useTwapOrder()
  const receiveAmountInfo = useScaledReceiveAmountInfo()
  const slippage = useTwapSlippage()
  const localFormValidation = useTwapFormState()
  const tradeConfirmActions = useTradeConfirmActions()
  const createTwapOrder = useCreateTwapOrder()
  const eoaTwapSigningStep = useEoaTwapSigningStep()
  const updateEoaTwapFlow = useEoaTwapFlowUpdater()

  // Re-check the balance against the (frozen) sell amount in case it changed while the modal was open
  const isInsufficientBalance = !useHasEnoughBalanceForAmount(inputCurrencyAmount)
  const isConfirmDisabled = !!localFormValidation || isInsufficientBalance
  const inputSymbol = inputCurrencyAmount?.currency?.symbol || t`token`

  const priceImpact = useTradePriceImpact()
  const fallbackHandlerIsNotSet = useIsFallbackHandlerRequired()

  const onDismiss = useCallback(() => {
    updateEoaTwapFlow(null)
    tradeConfirmActions.onDismiss()
  }, [updateEoaTwapFlow, tradeConfirmActions])

  const inputCurrencyInfo = {
    amount: inputCurrencyAmount,
    fiatAmount: inputCurrencyFiatAmount,
    balance: inputCurrencyBalance,
    label: t`Sell amount`,
  } satisfies CurrencyPreviewInfo

  const outputCurrencyInfo = {
    amount: outputCurrencyAmount,
    fiatAmount: outputCurrencyFiatAmount,
    balance: outputCurrencyBalance,
    label: t`Receive (before fees)`,
  } satisfies CurrencyPreviewInfo

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  const { timeInterval, numOfParts } = twapOrder || {}

  const partDuration = timeInterval
  const totalDuration = timeInterval && numOfParts ? timeInterval * numOfParts : undefined

  const hasSigningPlan = !!eoaTwapSigningStep

  const tradeDetailsElement =
    receiveAmountInfo && numOfParts ? (
      <TwapTradeConfirmationDetails
        rateInfoParams={rateInfoParams}
        receiveAmountInfo={receiveAmountInfo}
        slippage={slippage}
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

  const twapFormWarningsElement = <TwapFormWarnings localFormValidation={localFormValidation} isConfirmationModal />

  // Actually only rendered if hasSigningPlan / !!eoaTwapSigningStep:
  const eoaTwapSigningStepElement = <EoaTwapSigningPendingContent />

  return (
    <TradeConfirmModal orderType={UiOrderType.TWAP} showGetNotifiedMessage>
      <TradeConfirmation
        {...commonTradeConfirmContext}
        title={hasSigningPlan ? t`TWAP order` : t`Review TWAP`}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={() => createTwapOrder(fallbackHandlerIsNotSet)}
        onDismiss={onDismiss}
        isConfirmDisabled={isConfirmDisabled}
        priceImpact={priceImpact}
        buttonText={isInsufficientBalance ? t`Insufficient ${inputSymbol} balance` : t`Place TWAP order`}
        recipient={recipient}
        hasSigningPlan={hasSigningPlan}
      >
        {(restContent) => (
          <>
            {tradeDetailsElement}
            {restContent}
            {twapFormWarningsElement}
            {eoaTwapSigningStepElement}
          </>
        )}
        {/* hasSigningPlan ? <ConfirmButton .../> : null */}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
