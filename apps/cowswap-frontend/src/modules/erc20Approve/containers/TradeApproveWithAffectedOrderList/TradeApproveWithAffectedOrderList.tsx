import { ReactNode } from 'react'

import {
  ApproveRequiredReason,
  MAX_APPROVE_AMOUNT,
  useGetPartialAmountToSignApprove,
  useIsApprovalOrPermitRequired,
} from '../../hooks'
import { useSetUserApproveAmountModalState } from '../../state'
import { ActiveOrdersWithAffectedPermit } from '../ActiveOrdersWithAffectedPermit'
import { TradeApproveToggle } from '../TradeApproveToggle'

export function TradeApproveWithAffectedOrderList(): ReactNode {
  const isApproveRequired = useIsApprovalOrPermitRequired()

  const setUserApproveAmountModalState = useSetUserApproveAmountModalState()

  const amountToApprove = useGetPartialAmountToSignApprove()

  const showAffectedOrders =
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired &&
    amountToApprove?.quotient.toString() !== MAX_APPROVE_AMOUNT

  const isApproveOrPartialPermitRequired =
    isApproveRequired === ApproveRequiredReason.Required ||
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired

  return (
    <>
      {amountToApprove && isApproveOrPartialPermitRequired && (
        <TradeApproveToggle
          updateModalState={() => setUserApproveAmountModalState({ isModalOpen: true })}
          amountToApprove={amountToApprove}
        />
      )}
      {showAffectedOrders && amountToApprove && <ActiveOrdersWithAffectedPermit currency={amountToApprove?.currency} />}
    </>
  )
}
