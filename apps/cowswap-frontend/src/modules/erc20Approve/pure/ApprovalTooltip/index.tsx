import { ReactNode } from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

import { useIsPartialApproveSelectedByUser } from '../../state'

interface ApprovalTooltipProps {
  currency: Currency
}

export function ApprovalTooltip({ currency }: ApprovalTooltipProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()

  const baseText = (
    <Trans>
      You must give the CoW Protocol smart contracts permission to use your <TokenSymbol token={currency} />.
    </Trans>
  )

  if (isPartialApproveSelectedByUser) {
    return (
      <>
        {baseText} <Trans>If you approve the full amount, you will only have to do this once per token.</Trans>
      </>
    )
  }

  return baseText
}
