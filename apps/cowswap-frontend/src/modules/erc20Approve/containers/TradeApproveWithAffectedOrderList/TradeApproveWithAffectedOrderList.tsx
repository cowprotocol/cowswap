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

import type { AffectedOrdersApprovalTarget } from '../../types/affectedOrdersApprovalTarget.types'

export interface TradeApproveWithAffectedOrderListProps {
  approvalTarget?: AffectedOrdersApprovalTarget
}

export function TradeApproveWithAffectedOrderList({
  approvalTarget,
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
    (isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired || approvalTarget === 'poller') &&
    !isMaxAmountToApprove(finalAmountToApprove)

  const showApproveToggle = isApproveOrPartialPermitRequired || showAffectedOrders

  if (!partialAmountToApprove || !isPartialApprovalEnabledInSettings) return null

  const currencyToApprove = partialAmountToApprove.currency

  return (
    <>
      {showApproveToggle && (
        <TradeApproveToggle
          updateModalState={() => setUserApproveAmountModalState({ isModalOpen: true })}
          amountToApprove={partialAmountToApprove}
        />
      )}
      {showAffectedOrders && currencyToApprove && (
        <ActiveOrdersWithAffectedPermit
          currency={currencyToApprove}
          approvalTarget={approvalTarget ?? 'vault-relayer'}
        />
      )}
    </>
  )
}
