import { ReactNode, useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Toggle } from '../../pure/Toggle'
import { useIsPartialApproveSelectedByUser, useSetIsPartialApproveSelectedByUser } from '../../state'

type TradeApproveToggleProps = {
  amountToApprove: CurrencyAmount<Currency>
  updateModalState: () => void
}

export function TradeApproveToggle({ amountToApprove, updateModalState }: TradeApproveToggleProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const setIsPartialApproveSelectedByUser = useSetIsPartialApproveSelectedByUser()

  const openChangeApproveAmount = useCallback((): void => {
    updateModalState()
  }, [updateModalState])

  return (
    <>
      <Toggle
        isPartialApproveEnabled={isPartialApproveSelectedByUser}
        enablePartialApprove={setIsPartialApproveSelectedByUser}
        amountToApprove={amountToApprove}
        changeApproveAmount={openChangeApproveAmount}
      />
    </>
  )
}
