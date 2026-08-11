import { ReactNode, useMemo } from 'react'

import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { OrderSteps, useTradePriceImpact } from 'modules/trade'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { useEoaTwapSigningStep } from '../../hooks/useEoaTwapSigningStep'
import { buildEoaTwapConfirmationPendingSteps } from '../../utils/buildEoaTwapConfirmationPendingSteps'

interface EoaTwapSigningPendingContentProps {
  onDismiss: Command
  tradeDetailsSlot: ReactNode
}

export function EoaTwapSigningPendingContent({
  onDismiss,
  tradeDetailsSlot,
}: EoaTwapSigningPendingContentProps): ReactNode {
  const signingStep = useEoaTwapSigningStep()
  const {
    inputCurrencyAmount,
    inputCurrencyFiatAmount,
    inputCurrencyBalance,
    outputCurrencyAmount,
    outputCurrencyFiatAmount,
    outputCurrencyBalance,
  } = useAdvancedOrdersDerivedState()
  const priceImpact = useTradePriceImpact()
  const symbol = inputCurrencyAmount?.currency.symbol

  const steps = useMemo(() => {
    return signingStep ? buildEoaTwapConfirmationPendingSteps({ signingStep, symbol }) : undefined
  }, [signingStep, symbol])

  if (!steps) {
    return null
  }

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

  return (
    <OrderSteps
      title={t`TWAP order`}
      badge={t`Action required`}
      onClose={!!signingStep?.lockDismiss ? undefined : onDismiss}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
      priceImpact={priceImpact}
      tradeDetailsSlot={tradeDetailsSlot}
      steps={steps}
    />
  )
}
