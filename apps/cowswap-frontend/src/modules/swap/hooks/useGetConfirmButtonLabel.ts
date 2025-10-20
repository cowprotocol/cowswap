import { ApproveRequiredReason, useIsApprovalOrPermitRequired } from 'modules/erc20Approve'
import { useIsCurrentTradeBridging } from 'modules/trade'

enum ConfirmButtonLabel {
  SWAP = 'Swap',
  SWAP_BRIDGE = 'Swap and Bridge',
  APPROVE_SWAP = 'Approve and Swap',
  APPROVE_SWAP_BRIDGE = 'Approve, Swap & Bridge',
}

export function useGetConfirmButtonLabel(): string {
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const { reason: approveRequiredReason } = useIsApprovalOrPermitRequired({
    isBundlingSupportedOrEnabledForContext: false,
  })

  if (approveRequiredReason === ApproveRequiredReason.Required) {
    return isCurrentTradeBridging ? ConfirmButtonLabel.APPROVE_SWAP_BRIDGE : ConfirmButtonLabel.APPROVE_SWAP
  }

  return isCurrentTradeBridging ? ConfirmButtonLabel.SWAP_BRIDGE : ConfirmButtonLabel.SWAP
}
