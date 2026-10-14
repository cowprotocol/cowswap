import { ReactNode } from 'react'

import { useIsTxBundlingSupported, useWalletDetails } from '@cowprotocol/wallet'

import { usePermitInfo } from 'modules/permit'

import { TradeType } from 'common/modules/tradeNavigation'

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
  // ADVANCED_ORDERS has permits disabled (EOA TWAP uses poller, Safe uses vault-relayer). SWAP only to read token type.
  const permitInfo = usePermitInfo(partialAmountToApprove?.currency, TradeType.SWAP)
  const isDaiLikePermit = permitInfo?.type === 'dai-like'

  const isApproveOrPartialPermitRequired =
    isApproveRequired === ApproveRequiredReason.Required ||
    isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired ||
    isApproveRequired === ApproveRequiredReason.BundleApproveRequired

  const showAffectedOrders =
    (isApproveRequired === ApproveRequiredReason.Eip2612PermitRequired ||
      (approvalTarget === 'poller' && isApproveOrPartialPermitRequired)) &&
    !isMaxAmountToApprove(finalAmountToApprove)

  const showApproveToggle = !isDaiLikePermit && (isApproveOrPartialPermitRequired || showAffectedOrders)

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
