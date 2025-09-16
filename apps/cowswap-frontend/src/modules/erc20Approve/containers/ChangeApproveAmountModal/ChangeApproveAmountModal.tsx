import { ReactNode, useCallback, useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'

import { ChangeApproveAmountModalPure } from './ChangeApproveAmountModalPure'

import { useGetPartialAmountToSignApprove } from '../../hooks'
import {
  useCustomApproveAmountInputState,
  useSetUserApproveAmountModalState,
  useUpdateOrResetCustomApproveAmountInputState,
} from '../../state'

export function ChangeApproveAmountModal(): ReactNode {
  const setUserApproveAmountState = useSetUserApproveAmountModalState()
  const { amount: approveAmountInput } = useCustomApproveAmountInputState() || {}
  const [_, resetCustomApproveAmountInput] = useUpdateOrResetCustomApproveAmountInputState()
  const initialAmountToApprove = useGetPartialAmountToSignApprove()

  const { isInvalid } = useCustomApproveAmountInputState()

  const onBack = (): void => {
    setUserApproveAmountState({ isModalOpen: false, amountSetByUser: undefined })
    resetCustomApproveAmountInput()
  }

  const OnConfirm = useCallback(() => {
    setUserApproveAmountState({ isModalOpen: false, amountSetByUser: approveAmountInput ?? undefined })
    resetCustomApproveAmountInput()
  }, [setUserApproveAmountState, approveAmountInput, resetCustomApproveAmountInput])

  const inputToken = useMemo(
    () => (initialAmountToApprove ? getWrappedToken(initialAmountToApprove.currency) : null),
    [initialAmountToApprove],
  )

  return (
    <ChangeApproveAmountModalPure
      inputToken={inputToken}
      initialAmount={initialAmountToApprove}
      onBack={onBack}
      isInvalid={isInvalid}
      onConfirm={OnConfirm}
    />
  )
}
