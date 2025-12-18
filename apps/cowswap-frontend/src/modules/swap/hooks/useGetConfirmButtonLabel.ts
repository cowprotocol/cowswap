import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { t } from '@lingui/core/macro'

import { useIsApprovalOrPermitRequired } from 'modules/erc20Approve'
import { useIsCurrentTradeBridging } from 'modules/trade'

function getSwapLabel(isBridging: boolean): string {
  return isBridging ? t`Swap and Bridge` : t`Swap`
}

export function useGetConfirmButtonLabel(): string {
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const isPermitOrApproveRequired = useIsApprovalOrPermitRequired({ isBundlingSupportedOrEnabledForContext: false })
  const { isPartialApproveEnabled } = useFeatureFlags()

  if (!isPartialApproveEnabled) {
    return getSwapLabel(isCurrentTradeBridging)
  }

  if (isPermitOrApproveRequired) {
    return isCurrentTradeBridging ? t`Approve, Swap & Bridge` : t`Approve and Swap`
  }

  return getSwapLabel(isCurrentTradeBridging)
}
