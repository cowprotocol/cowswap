import { ReactNode } from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

interface ApprovalTooltipProps {
  currency: Currency
}

export function ApprovalTooltip({ currency }: ApprovalTooltipProps): ReactNode {
  return (
    <Trans>
      You must give the CoW Protocol smart contracts permission to use your <TokenSymbol token={currency} />. If you approve the default amount, you will only have to
      do this once per token.
    </Trans>
  )
}
