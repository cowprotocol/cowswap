import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useUpdatePartialApproveAmountModalState } from '../../state'
import { ChangeApproveAmountModal } from '../ChangeApproveAmountModal'

type TradeChangeApproveAmountModalProps = {
  initialAmountToApprove: CurrencyAmount<Currency> | null
}

export function PartialApproveAmountModal({ initialAmountToApprove }: TradeChangeApproveAmountModalProps): ReactNode {
  const updatePendingApproveAmountModalState = useUpdatePartialApproveAmountModalState()

  return (
    <ChangeApproveAmountModal
      setUserApproveAmountState={updatePendingApproveAmountModalState}
      initialAmountToApprove={initialAmountToApprove}
    />
  )
}
