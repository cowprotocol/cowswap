import { t } from '@lingui/core/macro'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useHasEnoughBalanceForAmount } from 'modules/combinedBalances'
import { getOrderTypeReceiveAmounts, useTradeConfirmState } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { useScaledReceiveAmountInfo } from '../../hooks/useScaledReceiveAmountInfo'
import { useTwapFormState } from '../../hooks/useTwapFormState'

interface UseTwapConfirmCurrencyPreviewReturn {
  inputCurrencyInfo: CurrencyPreviewInfo
  inputSymbolLabel: string
  isConfirmDisabled: boolean
  isInsufficientBalance: boolean
  localFormValidation: ReturnType<typeof useTwapFormState>
  outputCurrencyInfo: CurrencyPreviewInfo
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  receiveAmountInfo: ReturnType<typeof useScaledReceiveAmountInfo>
}

export function useTwapConfirmCurrencyPreview(): UseTwapConfirmCurrencyPreviewReturn {
  const {
    inputCurrencyAmount,
    inputCurrencyFiatAmount,
    inputCurrencyBalance,
    outputCurrencyAmount,
    outputCurrencyFiatAmount,
    outputCurrencyBalance,
  } = useAdvancedOrdersDerivedState()
  const receiveAmountInfo = useScaledReceiveAmountInfo()
  const localFormValidation = useTwapFormState()
  const { isConfirming, pendingTrade } = useTradeConfirmState()
  const eoaTwapSigningStep = useEoaTwapSigningStep()
  const isInsufficientBalance = !useHasEnoughBalanceForAmount(inputCurrencyAmount)
  const amountAfterFees = receiveAmountInfo ? getOrderTypeReceiveAmounts(receiveAmountInfo).amountAfterFees : null
  const amountAfterFeesUsd = useUsdAmount(amountAfterFees).value

  const inputSymbolLabel = inputCurrencyAmount?.currency?.symbol || t`token`
  const isConfirmDisabled = !!localFormValidation || isInsufficientBalance
  const showExpectedToReceive = isConfirming || !!pendingTrade || !!eoaTwapSigningStep

  const inputCurrencyInfo = {
    amount: inputCurrencyAmount,
    fiatAmount: inputCurrencyFiatAmount,
    balance: inputCurrencyBalance,
    label: t`Sell amount`,
  } satisfies CurrencyPreviewInfo

  const outputCurrencyInfo = showExpectedToReceive
    ? {
        amount: amountAfterFees,
        fiatAmount: amountAfterFeesUsd,
        balance: outputCurrencyBalance,
        label: t`Expected to receive`,
        prefix: '≈',
      }
    : {
        amount: outputCurrencyAmount,
        fiatAmount: outputCurrencyFiatAmount,
        balance: outputCurrencyBalance,
        label: t`Receive (before fees)`,
      }

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  return {
    inputCurrencyInfo,
    inputSymbolLabel,
    isConfirmDisabled,
    isInsufficientBalance,
    localFormValidation,
    outputCurrencyInfo,
    rateInfoParams,
    receiveAmountInfo,
  }
}
