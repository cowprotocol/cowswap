import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

import { useUpdatePartialApproveAmountModalState } from '../../state'
import { ChangeApproveAmountModal } from '../ChangeApproveAmountModal'

type TradeChangeApproveAmountModalProps = {
  initialAmountToApprove: CurrencyAmount<Currency> | null
  // min amount that needed to be swapped (you can't approve less than this amount)
  amountToSwap: Nullish<CurrencyAmount<Currency>>
  // amount the order is expected to buy; used by the preview so it reflects the order being edited
  amountToBuy?: Nullish<CurrencyAmount<Currency>>
}

export function PartialApproveAmountModal({
  initialAmountToApprove,
  amountToSwap,
  amountToBuy,
}: TradeChangeApproveAmountModalProps): ReactNode {
  const updatePartialApproveAmountModalState = useUpdatePartialApproveAmountModalState()

  return (
    <ChangeApproveAmountModal
      setUserApproveAmountState={updatePartialApproveAmountModalState}
      initialAmountToApprove={initialAmountToApprove}
      amountToSwap={amountToSwap}
      amountToBuy={amountToBuy}
    />
  )
}
