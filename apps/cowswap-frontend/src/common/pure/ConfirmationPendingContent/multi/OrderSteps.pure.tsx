import { ReactNode } from 'react'

import { ModalHeader } from '@cowprotocol/ui'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { ConfirmAmounts } from 'modules/trade'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { NewModalContent } from 'common/pure/NewModal'
import { OrderStepHeaderProps } from './header/OrderStepHeader.pure'
import { OrderStep, OrderStepItem } from './item/OrderStepItem.pure'
import * as styledEl from './OrderSteps.styled'

export interface OrderStepsProps extends OrderStepHeaderProps {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  tradeDetailsSlot: ReactNode

  /**
   * Arbitrary multi-step progress.
   */
  steps: OrderStep[]
}

export function OrderSteps({
  title,
  onBack,
  onClose,
  inputCurrencyInfo,
  outputCurrencyInfo,
  priceImpact,
  tradeDetailsSlot,
  steps,
}: OrderStepsProps): ReactNode {
  return (
    <styledEl.Root>
      <ModalHeader onBack={onBack} onClose={onClose}>
        {title}
      </ModalHeader>

      <NewModalContent>
        <styledEl.OrderSummary>
          <ConfirmAmounts
            inputCurrencyInfo={inputCurrencyInfo}
            outputCurrencyInfo={outputCurrencyInfo}
            priceImpact={priceImpact}
          />
          {tradeDetailsSlot}
        </styledEl.OrderSummary>

        <styledEl.StepsList>
          {steps.map((step) => (
            <OrderStepItem key={step.id} step={step} />
          ))}
        </styledEl.StepsList>
      </NewModalContent>
    </styledEl.Root>
  )
}
