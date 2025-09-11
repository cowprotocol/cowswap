import { ReactNode, useCallback } from 'react'

import { useGetPartialAmountToSignApprove } from '../../hooks'
import { Toggle } from '../../pure/Toggle'
import {
  useIsPartialApproveSelectedByUser,
  useSetIsPartialApproveSelectedByUser,
  useSetUserApproveAmountModalState,
} from '../../state'

export function TradeApproveToggle(): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const setIsPartialApproveSelectedByUser = useSetIsPartialApproveSelectedByUser()
  const updateUserApproveAmountModalState = useSetUserApproveAmountModalState()

  const openChangeApproveAmount = useCallback((): void => {
    updateUserApproveAmountModalState({ isModalOpen: true })
  }, [updateUserApproveAmountModalState])

  const amountToApprove = useGetPartialAmountToSignApprove()

  if (!amountToApprove) return null

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
