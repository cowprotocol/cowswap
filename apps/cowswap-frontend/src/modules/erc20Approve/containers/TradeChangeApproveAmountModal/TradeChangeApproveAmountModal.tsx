import { ReactNode } from 'react'

import { useGetPartialAmountToSignApprove } from '../../hooks'
import { useSetUserApproveAmountModalState } from '../../state'
import { ChangeApproveAmountModal } from '../ChangeApproveAmountModal'

export function TradeChangeApproveAmountModal(): ReactNode {
  const setUserApproveAmountModalState = useSetUserApproveAmountModalState()
  const initialAmountToApprove = useGetPartialAmountToSignApprove()

  return (
    <ChangeApproveAmountModal
      setUserApproveAmountState={setUserApproveAmountModalState}
      initialAmountToApprove={initialAmountToApprove}
    />
  )
}
