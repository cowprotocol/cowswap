import { ReactNode, useCallback, useState } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useIsInfiniteApproveDisabled } from '../../hooks/useIsInfiniteApproveDisabled'
import { ApprovalAmountRow } from '../../pure/ApprovalAmountRow/ApprovalAmountRow.pure'
import { Toggle } from '../../pure/Toggle'
import { useIsPartialApproveSelectedByUser, useSetIsPartialApproveSelectedByUser } from '../../state'

type TradeApproveToggleProps = {
  amountToApprove: CurrencyAmount<Currency>
  updateModalState: () => void
  /** Break expanded controls out of TradeRows horizontal padding (trade forms only). */
  wideDetails?: boolean
}

export function TradeApproveToggle({
  amountToApprove,
  updateModalState,
  wideDetails = false,
}: TradeApproveToggleProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const setIsPartialApproveSelectedByUser = useSetIsPartialApproveSelectedByUser()
  const isInfiniteApproveDisabled = useIsInfiniteApproveDisabled()
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  if (isInfiniteApproveDisabled) return null

  return (
    <ApprovalAmountRow
      isOpen={isOpen}
      onToggle={toggleOpen}
      isPartialApproveSelected={isPartialApproveSelectedByUser}
      amountToApprove={amountToApprove}
      wideDetails={wideDetails}
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
