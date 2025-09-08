import { ReactNode, useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Toggle } from '../../pure/Toggle'
import {
  useIsPartialApproveSelectedByUser,
  useSetChangeApproveAmountState,
  useSetIsPartialApproveSelectedByUser,
} from '../../state'

export function TradeApproveToggle({ amountToApprove }: { amountToApprove: CurrencyAmount<Currency> }): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const setIsPartialApproveSelectedByUser = useSetIsPartialApproveSelectedByUser()
  const changeApproveAmount = useSetChangeApproveAmountState()

  const openChangeApproveAmount = useCallback((): void => {
    changeApproveAmount({ inProgress: true })
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
