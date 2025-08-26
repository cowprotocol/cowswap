import React, { ReactNode } from 'react'

import { TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Option } from './Option'

export function Toggle({
  isPartialApproveEnabled,
  enablePartialApprove,
  amountToApprove,
}: {
  isPartialApproveEnabled: boolean
  enablePartialApprove: (isPartialApproveEnabled: boolean) => void
  amountToApprove: CurrencyAmount<Currency>
}): ReactNode {
  return (
    <div>
      <Option isActive={isPartialApproveEnabled} onClick={() => enablePartialApprove(true)} title={'Partial approval'}>
        {amountToApprove.toExact()} <TokenSymbol token={amountToApprove.currency} />
      </Option>
      <Option isActive={!isPartialApproveEnabled} onClick={() => enablePartialApprove(false)} title={'Full approval'}>
        Unlimited one-time
      </Option>
    </div>
  )
}
