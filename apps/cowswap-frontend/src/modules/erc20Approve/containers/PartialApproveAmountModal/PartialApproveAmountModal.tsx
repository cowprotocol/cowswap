import { ReactNode } from 'react'

import { Nullish } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useUpdatePartialApproveAmountModalState } from '../../state'
import { ChangeApproveAmountModal } from '../ChangeApproveAmountModal'

type TradeChangeApproveAmountModalProps = {
  initialAmountToApprove: CurrencyAmount<Currency> | null
  // min amount that needed to be swapped (you can't approve less than this amount)
  amountToSwap: Nullish<CurrencyAmount<Currency>>
}

export function PartialApproveAmountModal({
  initialAmountToApprove,
  amountToSwap,
}: TradeChangeApproveAmountModalProps): ReactNode {
  const updatePartialApproveAmountModalState = useUpdatePartialApproveAmountModalState()

  return (
    <ChangeApproveAmountModal
      setUserApproveAmountState={updatePartialApproveAmountModalState}
      initialAmountToApprove={initialAmountToApprove}
      amountToSwap={amountToSwap}
    />
  )
}
