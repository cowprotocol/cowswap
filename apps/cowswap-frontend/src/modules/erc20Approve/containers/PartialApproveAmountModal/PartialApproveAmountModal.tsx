import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useUpdatePartialApproveAmountModalState } from '../../state'
import { ChangeApproveAmountModal } from '../ChangeApproveAmountModal'

type TradeChangeApproveAmountModalProps = {
  initialAmountToApprove: CurrencyAmount<Currency> | null
}

export function PartialApproveAmountModal({ initialAmountToApprove }: TradeChangeApproveAmountModalProps): ReactNode {
  const updatePartialApproveAmountModalState = useUpdatePartialApproveAmountModalState()

  return (
    <ChangeApproveAmountModal
      setUserApproveAmountState={updatePartialApproveAmountModalState}
      initialAmountToApprove={initialAmountToApprove}
    />
  )
}
