import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useIsInfiniteApproveDisabledInWidget } from 'modules/injectedWidget'

import { Toggle } from '../../pure/Toggle'
import { useIsPartialApproveSelectedByUser, useSetIsPartialApproveSelectedByUser } from '../../state'

type TradeApproveToggleProps = {
  amountToApprove: CurrencyAmount<Currency>
  updateModalState: () => void
}

export function TradeApproveToggle({ amountToApprove, updateModalState }: TradeApproveToggleProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const setIsPartialApproveSelectedByUser = useSetIsPartialApproveSelectedByUser()
  const isInfiniteApproveDisabledInWidget = useIsInfiniteApproveDisabledInWidget()

  if (isInfiniteApproveDisabledInWidget) return null

  return (
    <Toggle
      isPartialApproveSelected={isPartialApproveSelectedByUser}
      selectPartialApprove={setIsPartialApproveSelectedByUser}
      amountToApprove={amountToApprove}
      changeApproveAmount={updateModalState}
    />
  )
}
