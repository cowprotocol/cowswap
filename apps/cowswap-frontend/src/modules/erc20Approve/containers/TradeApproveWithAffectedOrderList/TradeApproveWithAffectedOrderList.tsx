import { ReactNode, useMemo } from 'react'

import { useAmountsToSignFromQuote } from '../../../trade'
import { ApproveRequiredReason, MAX_APPROVE_AMOUNT, useIsApprovalOrPermitRequired } from '../../hooks'
import { useGetUserApproveAmountState, useSetUserApproveAmountModalState } from '../../state'
import { ActiveOrdersWithAffectedPermit } from '../ActiveOrdersWithAffectedPermit'
import { TradeApproveToggle } from '../TradeApproveToggle'

export function TradeApproveWithAffectedOrderList(): ReactNode {
  const isApproveRequired = useIsApprovalOrPermitRequired()

  const setUserApproveAmountModalState = useSetUserApproveAmountModalState()

  const { amountSetByUser } = useGetUserApproveAmountState() || {}
  const { maximumSendSellAmount } = useAmountsToSignFromQuote() || {}

  const amountToApprove = useMemo(
    () => amountSetByUser || maximumSendSellAmount,
    [amountSetByUser, maximumSendSellAmount],
  )

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
