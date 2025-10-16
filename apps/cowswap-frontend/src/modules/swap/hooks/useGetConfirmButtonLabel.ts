import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useLingui } from '@lingui/react/macro'

import { useIsApprovalOrPermitRequired } from 'modules/erc20Approve'
import { useIsCurrentTradeBridging } from 'modules/trade'

function getSwapLabel(isBridging: boolean): string {
  return isBridging ? 'Swap and Bridge' : 'Swap'
}

export function useGetConfirmButtonLabel(): string {
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const isPermitOrApproveRequired = useIsApprovalOrPermitRequired()
  const { isPartialApproveEnabled } = useFeatureFlags()
  const { t } = useLingui()

  if (!isPartialApproveEnabled) {
    return getSwapLabel(isCurrentTradeBridging)
  }

  if (isPermitOrApproveRequired) {
    return isCurrentTradeBridging ? t`Approve, Swap & Bridge` : t`Approve and Swap`
  }

  return getSwapLabel(isCurrentTradeBridging)
}
