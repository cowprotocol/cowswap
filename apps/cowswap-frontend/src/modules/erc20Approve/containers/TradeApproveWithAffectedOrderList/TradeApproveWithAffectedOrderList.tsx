import { ReactNode } from 'react'

import {
  ApproveRequiredReason,
  useGetAmountToSignApprove,
  useGetPartialAmountToSignApprove,
  useIsApprovalOrPermitRequired,
} from '../../hooks'
import { TradeAllowanceDisplay } from '../../pure/TradeAllowanceDisplay'
import { useSetUserApproveAmountModalState } from '../../state'
import { isMaxAmountToApprove } from '../../utils'
import { ActiveOrdersWithAffectedPermit } from '../ActiveOrdersWithAffectedPermit'
import { TradeApproveToggle } from '../TradeApproveToggle'

export function TradeApproveWithAffectedOrderList(): ReactNode {
  const { reason: isApproveRequired, currentAllowance } = useIsApprovalOrPermitRequired()

  const setUserApproveAmountModalState = useSetUserApproveAmountModalState()

  const partialAmountToApprove = useGetPartialAmountToSignApprove()
  const finalAmountToApprove = useGetAmountToSignApprove()

  const showAffectedOrders =
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired && !isMaxAmountToApprove(finalAmountToApprove)

  const isApproveOrPartialPermitRequired =
    isApproveRequired === ApproveRequiredReason.Required ||
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired

  const currencyToApprove = partialAmountToApprove?.currency

  return (
    <>
      {partialAmountToApprove && isApproveOrPartialPermitRequired && (
        <TradeApproveToggle
          updateModalState={() => setUserApproveAmountModalState({ isModalOpen: true })}
          amountToApprove={partialAmountToApprove}
        />
      )}
      {typeof currentAllowance === 'bigint' && currencyToApprove && (
        <TradeAllowanceDisplay currentAllowance={currentAllowance} currencyToApprove={currencyToApprove} />
      )}
      {showAffectedOrders && currencyToApprove && <ActiveOrdersWithAffectedPermit currency={currencyToApprove} />}
    </>
  )
}
