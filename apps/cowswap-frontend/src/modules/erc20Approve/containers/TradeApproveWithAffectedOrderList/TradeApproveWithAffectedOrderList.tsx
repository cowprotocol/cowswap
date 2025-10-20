import { ReactNode } from 'react'

import {
  ApproveRequiredReason,
  useGetAmountToSignApprove,
  useGetPartialAmountToSignApprove,
  useIsApprovalOrPermitRequired,
} from '../../hooks'
import { useSetUserApproveAmountModalState } from '../../state'
import { isMaxAmountToApprove } from '../../utils'
import { ActiveOrdersWithAffectedPermit } from '../ActiveOrdersWithAffectedPermit'
import { TradeApproveToggle } from '../TradeApproveToggle'

export function TradeApproveWithAffectedOrderList(): ReactNode {
  const isApproveRequired = useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: false })

  const setUserApproveAmountModalState = useSetUserApproveAmountModalState()

  const partialAmountToApprove = useGetPartialAmountToSignApprove()
  const finalAmountToApprove = useGetAmountToSignApprove()

  const showAffectedOrders =
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired && !isMaxAmountToApprove(finalAmountToApprove)

  const isApproveOrPartialPermitRequired =
    isApproveRequired === ApproveRequiredReason.Required ||
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired

  return (
    <>
      {partialAmountToApprove && isApproveOrPartialPermitRequired && (
        <TradeApproveToggle
          updateModalState={() => setUserApproveAmountModalState({ isModalOpen: true })}
          amountToApprove={partialAmountToApprove}
        />
      )}
      {showAffectedOrders && partialAmountToApprove && (
        <ActiveOrdersWithAffectedPermit currency={partialAmountToApprove?.currency} />
      )}
    </>
  )
}
