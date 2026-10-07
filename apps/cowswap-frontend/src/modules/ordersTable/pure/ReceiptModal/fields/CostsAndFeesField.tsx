import { ReactNode } from 'react'

import { Loader } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { CostsAndFeesBreakdown, OrderCostsAndFeesState } from 'modules/orderCostsAndFees'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { FeeField } from './FeeField'
import { FieldLabel } from './FieldLabel'

import * as styledEl from '../ReceiptModal.styled'

export interface CostsAndFeesFieldProps {
  costsAndFees: OrderCostsAndFeesState
  order: ParsedOrder
  costsAndFeesTooltip: string
  networkCostsTooltip: string
}

export function CostsAndFeesField({
  costsAndFees,
  order,
  costsAndFeesTooltip,
  networkCostsTooltip,
}: CostsAndFeesFieldProps): ReactNode {
  if (costsAndFees.status === 'unavailable') {
    return (
      <styledEl.Field>
        <FieldLabel label={t`Network fees and costs`} tooltip={networkCostsTooltip} />
        <FeeField order={order} />
      </styledEl.Field>
    )
  }

  return (
    <styledEl.Field>
      <FieldLabel label={t`Costs and fees`} tooltip={costsAndFeesTooltip} />
      {costsAndFees.status === 'loading' ? (
        <Loader size="14px" aria-label={t`Loading`} />
      ) : (
        <CostsAndFeesBreakdown costs={costsAndFees.costs} tokens={[order.inputToken, order.outputToken]} />
      )}
    </styledEl.Field>
  )
}
