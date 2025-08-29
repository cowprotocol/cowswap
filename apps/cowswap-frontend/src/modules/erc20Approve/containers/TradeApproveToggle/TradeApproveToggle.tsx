import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Toggle } from '../../pure/Toggle'
import { useIsPartialApproveSelectedByUser, useSetIsPartialApproveSelectedByUser } from '../../state'

export function TradeApproveToggle({ amountToApprove }: { amountToApprove: CurrencyAmount<Currency> }): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const setIsPartialApproveSelectedByUser = useSetIsPartialApproveSelectedByUser()

  return (
    <>
      <Toggle
        isPartialApproveEnabled={isPartialApproveSelectedByUser}
        enablePartialApprove={setIsPartialApproveSelectedByUser}
        amountToApprove={amountToApprove}
      />
    </>
  )
}
