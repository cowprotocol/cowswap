import { ReactNode } from 'react'

import {
  ApproveRequiredReason,
  MAX_APPROVE_AMOUNT,
  useGetAmountToSignApprove,
  useIsApprovalOrPermitRequired,
} from '../../hooks'
import { ActiveOrdersWithAffectedPermit } from '../ActiveOrdersWithAffectedPermit'
import { TradeApproveToggle } from '../TradeApproveToggle'

export function ApproveWithAffectedOrderList(): ReactNode {
  const isApproveRequired = useIsApprovalOrPermitRequired()
  const amountToApprove = useGetAmountToSignApprove()

  const showAffectedOrders =
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired &&
    amountToApprove?.quotient.toString() !== MAX_APPROVE_AMOUNT

  const isApproveOrPartialPermitRequired =
    isApproveRequired === ApproveRequiredReason.Required ||
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired

  return (
    <>
      {isApproveOrPartialPermitRequired && <TradeApproveToggle />}
      {showAffectedOrders && amountToApprove && <ActiveOrdersWithAffectedPermit currency={amountToApprove?.currency} />}
    </>
  )
}
