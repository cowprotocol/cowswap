import { ReactNode, useState } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Toggle } from '../../pure/Toggle'

export function TradeApproveToggle({ amountToApprove }: { amountToApprove: CurrencyAmount<Currency> }): ReactNode {
  // todo replace by atom
  const [enablePartialApprove, setEnablePartialApprove] = useState(true)

  return (
    <>
      <Toggle
        isPartialApproveEnabled={enablePartialApprove}
        enablePartialApprove={setEnablePartialApprove}
        amountToApprove={amountToApprove}
      />
    </>
  )
}
