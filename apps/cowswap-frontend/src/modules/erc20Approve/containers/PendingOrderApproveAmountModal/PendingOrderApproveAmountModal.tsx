import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useUpdatePendingApproveAmountModalState } from '../../state'
import { ChangeApproveAmountModal } from '../ChangeApproveAmountModal'

type TradeChangeApproveAmountModalProps = {
  initialAmountToApprove: CurrencyAmount<Currency> | null
}

export function PendingOrderApproveAmountModal({
  initialAmountToApprove,
}: TradeChangeApproveAmountModalProps): ReactNode {
  const updatePendingApproveAmountModalState = useUpdatePendingApproveAmountModalState()

  return (
    <ChangeApproveAmountModal
      setUserApproveAmountState={updatePendingApproveAmountModalState}
      initialAmountToApprove={initialAmountToApprove}
    />
  )
}
