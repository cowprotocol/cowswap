import { ReactNode, useCallback, useState } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useIsInfiniteApproveDisabledInWidget } from 'modules/injectedWidget'

import { ApprovalAmountRow } from '../../pure/ApprovalAmountRow/ApprovalAmountRow.pure'
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
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  if (isInfiniteApproveDisabledInWidget) return null

  return (
    <ApprovalAmountRow
      isOpen={isOpen}
      onToggle={toggleOpen}
      isPartialApproveSelected={isPartialApproveSelectedByUser}
      amountToApprove={amountToApprove}
    >
      <Toggle
        isPartialApproveSelected={isPartialApproveSelectedByUser}
        selectPartialApprove={setIsPartialApproveSelectedByUser}
        amountToApprove={amountToApprove}
        changeApproveAmount={updateModalState}
      />
    </ApprovalAmountRow>
  )
}
