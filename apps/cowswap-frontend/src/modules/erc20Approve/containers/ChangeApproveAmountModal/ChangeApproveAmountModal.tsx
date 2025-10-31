import { ReactNode, useCallback, useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ChangeApproveAmountModalPure } from './ChangeApproveAmountModalPure'
import { UserApproveModalState } from './userApproveAmountModalAtom'

import { useCustomApproveAmountInputState, useUpdateOrResetCustomApproveAmountInputState } from '../../state'

interface ChangeApproveAmountModalProps {
  setUserApproveAmountState: (state: Partial<UserApproveModalState>) => void
  initialAmountToApprove: CurrencyAmount<Currency> | null
  amountToSwap: Nullish<CurrencyAmount<Currency>>
}

export function ChangeApproveAmountModal({
  setUserApproveAmountState,
  initialAmountToApprove,
  amountToSwap,
}: ChangeApproveAmountModalProps): ReactNode {
  const { amount: approveAmountInput, isInvalid, isChanged } = useCustomApproveAmountInputState() || {}
  const [, resetCustomApproveAmountInput] = useUpdateOrResetCustomApproveAmountInputState()

  const onBack = useCallback((): void => {
    const updatedApproveAmountModalState: Partial<UserApproveModalState> = { isModalOpen: false }
    if (isChanged) {
      updatedApproveAmountModalState.amountSetByUser = undefined
    }

    setUserApproveAmountState(updatedApproveAmountModalState)
    resetCustomApproveAmountInput()
  }, [isChanged, resetCustomApproveAmountInput, setUserApproveAmountState])

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
      amountToSwap={amountToSwap}
      isInvalid={isInvalid}
      onBack={onBack}
      onReset={onReset}
      onConfirm={onConfirm}
    />
  )
}
