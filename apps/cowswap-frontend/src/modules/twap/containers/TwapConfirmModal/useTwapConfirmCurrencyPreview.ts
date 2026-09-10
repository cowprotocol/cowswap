import { t } from '@lingui/core/macro'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useHasEnoughBalanceForAmount } from 'modules/combinedBalances'
import { getOrderTypeReceiveAmounts } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

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
  const { inputCurrencyAmount, inputCurrencyFiatAmount, inputCurrencyBalance, outputCurrencyBalance } =
    useAdvancedOrdersDerivedState()
  const receiveAmountInfo = useScaledReceiveAmountInfo()
  const localFormValidation = useTwapFormState()

  const isInsufficientBalance = !useHasEnoughBalanceForAmount(inputCurrencyAmount)
  const isConfirmDisabled = !!localFormValidation || isInsufficientBalance
  const inputSymbolLabel = inputCurrencyAmount?.currency?.symbol || t`token`

  const inputCurrencyInfo = {
    amount: inputCurrencyAmount,
    fiatAmount: inputCurrencyFiatAmount,
    balance: inputCurrencyBalance,
    label: t`Sell amount`,
  } satisfies CurrencyPreviewInfo

  const amountAfterFees = receiveAmountInfo ? getOrderTypeReceiveAmounts(receiveAmountInfo).amountAfterFees : null
  const amountAfterFeesUsd = useUsdAmount(amountAfterFees).value

  const outputCurrencyInfo = {
    amount: amountAfterFees,
    fiatAmount: amountAfterFeesUsd,
    balance: outputCurrencyBalance,
    label: t`Expected to receive`,
    prefix: '≈',
  } satisfies CurrencyPreviewInfo

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
