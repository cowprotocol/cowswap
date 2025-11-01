import { ReactNode } from 'react'

import {
  ApproveRequiredReason,
  useGetAmountToSignApprove,
  useGetPartialAmountToSignApprove,
  useIsApprovalOrPermitRequired,
  useIsPartialApprovalModeSelected,
} from '../../hooks'
import { useSetUserApproveAmountModalState } from '../../state'
import { isMaxAmountToApprove } from '../../utils'
import { ActiveOrdersWithAffectedPermit } from '../ActiveOrdersWithAffectedPermit'
import { TradeApproveToggle } from '../TradeApproveToggle'

export function TradeApproveWithAffectedOrderList(): ReactNode {
  const { reason: isApproveRequired } = useIsApprovalOrPermitRequired({
    isBundlingSupportedOrEnabledForContext: false,
  })
  const isPartialApprovalEnabledInSettings = useIsPartialApprovalModeSelected()

  const setUserApproveAmountModalState = useSetUserApproveAmountModalState()

  const partialAmountToApprove = useGetPartialAmountToSignApprove()
  const finalAmountToApprove = useGetAmountToSignApprove()

  const showAffectedOrders =
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired && !isMaxAmountToApprove(finalAmountToApprove)

  const isApproveOrPartialPermitRequired =
    isApproveRequired === ApproveRequiredReason.Required ||
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired

  if (!partialAmountToApprove || !isPartialApprovalEnabledInSettings) return null

  const currencyToApprove = partialAmountToApprove.currency

  return (
    <>
      {isApproveOrPartialPermitRequired && (
        <>
          <TradeApproveToggle
            updateModalState={() => setUserApproveAmountModalState({ isModalOpen: true })}
            amountToApprove={partialAmountToApprove}
          />
        </>
      )}
      {showAffectedOrders && currencyToApprove && <ActiveOrdersWithAffectedPermit currency={currencyToApprove} />}
    </>
  )
}
