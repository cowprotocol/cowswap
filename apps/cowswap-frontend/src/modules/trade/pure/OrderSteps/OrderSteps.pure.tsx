import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { ModalHeader, Modal } from '@cowprotocol/ui'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { OrderStep, OrderStepItem } from './item/OrderStepItem.pure'
import * as styledEl from './OrderSteps.styled'

import { ConfirmAmounts } from '../TradeConfirmation/ConfirmAmounts'

export interface OrderStepsProps {
  title: string
  badge?: string
  onBack?: Command
  onClose?: Command
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
    <Modal.Root>
      <ModalHeader onBack={onBack} onClose={onClose}>
        {title}
      </ModalHeader>

      <Modal.Content>
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
      </Modal.Content>
    </Modal.Root>
  )
}
