import { ReactNode } from 'react'

import { useIsTxBundlingSupported, useWalletDetails } from '@cowprotocol/wallet'

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

export interface TradeApproveWithAffectedOrderListProps {
  forceShowAffectedOrders?: boolean
}

export function TradeApproveWithAffectedOrderList({
  forceShowAffectedOrders = false,
}: TradeApproveWithAffectedOrderListProps): ReactNode {
  const isBundlingSupported = useIsTxBundlingSupported()
  const { allowsOffchainSigning } = useWalletDetails()
  const { reason: isApproveRequired } = useIsApprovalOrPermitRequired({
    isBundlingSupportedOrEnabledForContext: isBundlingSupported,
    allowsOffchainSigning,
    ignoreLimitOrderPermitDeferral: true,
  })
  const isPartialApprovalEnabledInSettings = useIsPartialApprovalModeSelected()

  const setUserApproveAmountModalState = useSetUserApproveAmountModalState()

  const partialAmountToApprove = useGetPartialAmountToSignApprove()
  const finalAmountToApprove = useGetAmountToSignApprove()

  const isApproveOrPartialPermitRequired =
    isApproveRequired === ApproveRequiredReason.Required ||
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired ||
    isApproveRequired === ApproveRequiredReason.BundleApproveRequired

  const showAffectedOrders =
    (isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired || forceShowAffectedOrders) &&
    !isMaxAmountToApprove(finalAmountToApprove)

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
