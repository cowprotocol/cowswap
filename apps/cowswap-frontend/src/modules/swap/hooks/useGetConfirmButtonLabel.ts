import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useIsApprovalOrPermitRequired } from '../../erc20Approve'
import { useIsCurrentTradeBridging } from '../../trade'

function getSwapLabel(isBridging: boolean): string {
  return isBridging ? 'Swap and Bridge' : 'Swap'
}

export function useGetConfirmButtonLabel(): string {
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const isPermitOrApproveRequired = useIsApprovalOrPermitRequired()
  const { isPartialApproveEnabled } = useFeatureFlags()

  if (!isPartialApproveEnabled) {
    return getSwapLabel(isCurrentTradeBridging)
  }

  if (isPermitOrApproveRequired) {
    return isCurrentTradeBridging ? 'Approve, Swap & Bridge' : 'Approve and Swap'
  }

  return getSwapLabel(isCurrentTradeBridging)
}
