import { ReactNode, useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Toggle } from '../../pure/Toggle'
import {
  useIsPartialApproveSelectedByUser,
  useSetChangeApproveAmountModalState,
  useSetIsPartialApproveSelectedByUser,
} from '../../state'

export function TradeApproveToggle({ amountToApprove }: { amountToApprove: CurrencyAmount<Currency> }): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const setIsPartialApproveSelectedByUser = useSetIsPartialApproveSelectedByUser()
  const changeApproveAmount = useSetChangeApproveAmountModalState()

  const openChangeApproveAmount = useCallback((): void => {
    changeApproveAmount({ isModalOpen: true })
  }, [changeApproveAmount])

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
