import { ReactNode, useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Toggle } from '../../pure/Toggle'
import {
  useIsPartialApproveSelectedByUser,
  useSetIsPartialApproveSelectedByUser,
  useSetUserApproveAmountModalState,
} from '../../state'

type TradeApproveToggleProps = {
  amountToApprove: CurrencyAmount<Currency>
}

export function TradeApproveToggle({ amountToApprove }: TradeApproveToggleProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const setIsPartialApproveSelectedByUser = useSetIsPartialApproveSelectedByUser()
  const updateUserApproveAmountModalState = useSetUserApproveAmountModalState()

  const openChangeApproveAmount = useCallback((): void => {
    updateUserApproveAmountModalState({ isModalOpen: true })
  }, [updateUserApproveAmountModalState])

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
