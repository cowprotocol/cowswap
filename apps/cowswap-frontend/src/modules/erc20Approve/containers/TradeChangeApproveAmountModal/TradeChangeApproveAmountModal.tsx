import { ReactNode } from 'react'

import { useGetPartialAmountToSignApprove } from '../../hooks'
import { useSetUserApproveAmountModalState } from '../../state'
import { ChangeApproveAmountModal } from '../ChangeApproveAmountModal'

export function TradeChangeApproveAmountModal(): ReactNode {
  const setUserApproveAmountState = useSetUserApproveAmountModalState()
  const initialAmountToApprove = useGetPartialAmountToSignApprove()

  return (
    <ChangeApproveAmountModal
      setUserApproveAmountState={setUserApproveAmountState}
      initialAmountToApprove={initialAmountToApprove}
    />
  )
}
