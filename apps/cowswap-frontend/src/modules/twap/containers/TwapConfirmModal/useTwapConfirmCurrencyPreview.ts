import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useIsSafeViaWc, useIsSafeWallet } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useHasEnoughBalanceForAmount } from 'modules/combinedBalances'
import { getOrderTypeReceiveAmounts, useFreezeWhileConfirming, useTradeConfirmState } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { useScaledReceiveAmountInfo } from '../../hooks/useScaledReceiveAmountInfo'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { EoaTwapSigningSteps } from '../../state/eoaTwapSigningStepAtom'

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

// eslint-disable-next-line complexity
export function useTwapConfirmCurrencyPreview(): UseTwapConfirmCurrencyPreviewReturn {
  const {
    inputCurrencyAmount,
    inputCurrencyFiatAmount,
    inputCurrencyBalance,
    outputCurrencyAmount,
    outputCurrencyFiatAmount,
    outputCurrencyBalance,
  } = useAdvancedOrdersDerivedState()
  const liveReceiveAmountInfo = useScaledReceiveAmountInfo()
  const receiveAmountInfo = useFreezeWhileConfirming(liveReceiveAmountInfo)
  const localFormValidation = useTwapFormState()
  const { isConfirming, pendingTrade } = useTradeConfirmState()
  const eoaTwapSigningStep = useEoaTwapSigningStep()
  const isSafeWallet = useIsSafeWallet()
  const isSafeViaWc = useIsSafeViaWc()
  const { isTwapEoaEnabled } = useFeatureFlags()
  const isInsufficientBalance = !useHasEnoughBalanceForAmount(inputCurrencyAmount)
  const { amountAfterFees, amountAfterSlippage } = receiveAmountInfo
    ? getOrderTypeReceiveAmounts(receiveAmountInfo)
    : { amountAfterFees: null, amountAfterSlippage: null }
  const amountAfterFeesUsd = useUsdAmount(amountAfterFees).value

  const inputSymbolLabel = inputCurrencyAmount?.currency?.symbol || t`token`
  const isConfirmDisabled = !!localFormValidation || isInsufficientBalance
  const isEoaTwap = isTwapEoaEnabled && !isSafeWallet && !isSafeViaWc
  const showExpectedToReceive = isEoaTwap && (isConfirming || !!pendingTrade || !!eoaTwapSigningStep)
  const isEoaTwapSuccess = eoaTwapSigningStep?.step === EoaTwapSigningSteps.Success

  const inputCurrencyInfo = {
    amount: inputCurrencyAmount,
    fiatAmount: inputCurrencyFiatAmount,
    balance: inputCurrencyBalance,
    label: t`Sell amount`,
  } satisfies CurrencyPreviewInfo

  const outputCurrencyInfo = (
    showExpectedToReceive
      ? {
          amount: amountAfterFees,
          fiatAmount: amountAfterFeesUsd,
          balance: outputCurrencyBalance,
          label: t`Expected to receive`,
          prefix: '≈',
          secondaryAmount:
            isEoaTwapSuccess && amountAfterSlippage
              ? {
                  amount: amountAfterSlippage,
                  prefix: `${t`Min.`} `,
                  tooltip: t`Minimum total if all parts fill. Parts that can't meet your price limit are skipped, so you may receive less overall and keep the unsold tokens.`,
                }
              : undefined,
        }
      : {
          amount: outputCurrencyAmount,
          fiatAmount: outputCurrencyFiatAmount,
          balance: outputCurrencyBalance,
          label: t`Receive (before fees)`,
        }
  ) satisfies CurrencyPreviewInfo

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
