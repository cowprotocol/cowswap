import { ReactNode } from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

import { useIsPartialApproveSelectedByUser } from '../../state'

interface ApprovalTooltipProps {
  currency: Currency
  isLegacyApproval?: boolean
}

export function ApprovalTooltip({ currency, isLegacyApproval = false }: ApprovalTooltipProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()

  const baseText = (
    <Trans>
      You must give the CoW Protocol smart contracts permission to use your <TokenSymbol token={currency} />.
    </Trans>
  )

  if (isPartialApproveSelectedByUser || isLegacyApproval) {
    return (
      <>
        {baseText} <Trans>If you approve an unlimited amount, you will only have to do this once per token.</Trans>
      </>
    )
  }

  return baseText
}
