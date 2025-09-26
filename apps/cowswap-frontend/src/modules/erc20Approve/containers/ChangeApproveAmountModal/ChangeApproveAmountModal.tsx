import { ReactNode, useCallback, useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ChangeApproveAmountModalPure } from './ChangeApproveAmountModalPure'
import { UserApproveModalState } from './userApproveAmountModalAtom'

import { useCustomApproveAmountInputState, useUpdateOrResetCustomApproveAmountInputState } from '../../state'

interface ChangeApproveAmountModalProps {
  setUserApproveAmountState: (state: Partial<UserApproveModalState>) => void
  initialAmountToApprove: CurrencyAmount<Currency> | null
}

export function ChangeApproveAmountModal({
  setUserApproveAmountState,
  initialAmountToApprove,
}: ChangeApproveAmountModalProps): ReactNode {
  const { amount: approveAmountInput, isInvalid } = useCustomApproveAmountInputState() || {}
  const [_, resetCustomApproveAmountInput] = useUpdateOrResetCustomApproveAmountInputState()

  const onBack = useCallback((): void => {
    setUserApproveAmountState({ isModalOpen: false, amountSetByUser: undefined })
    resetCustomApproveAmountInput()
  }, [setUserApproveAmountState, resetCustomApproveAmountInput])

  const onConfirm = useCallback(() => {
    setUserApproveAmountState({ isModalOpen: false, amountSetByUser: approveAmountInput ?? undefined })
    resetCustomApproveAmountInput()
  }, [setUserApproveAmountState, approveAmountInput, resetCustomApproveAmountInput])

  const inputToken = useMemo(
    () => (initialAmountToApprove ? getWrappedToken(initialAmountToApprove.currency) : null),
    [initialAmountToApprove],
  )

  const onReset = useCallback((): void => {
    setUserApproveAmountState({ amountSetByUser: undefined })
    resetCustomApproveAmountInput()
  }, [resetCustomApproveAmountInput, setUserApproveAmountState])

  return (
    <ChangeApproveAmountModalPure
      inputToken={inputToken}
      initialAmount={initialAmountToApprove}
      isInvalid={isInvalid}
      onBack={onBack}
      onReset={onReset}
      onConfirm={onConfirm}
    />
  )
}
