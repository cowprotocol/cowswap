import { ReactNode, useCallback, useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { ModalHeader } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { useGetPartialAmountToSignApprove } from '../../hooks'
import {
  useCustomApproveAmountInputState,
  useSetUserApproveAmountModalState,
  useUpdateOrResetCustomApproveAmountInputState,
} from '../../state'
import { ApprovalAmountInput } from '../ApprovalAmountInput/ApprovalAmountInput'
import { SwapAmountPreview } from '../SwapAmountPreview/SwapAmountPreview'

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
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack}>
        <styledEl.Title>
          <div>Edit partial approval</div>
          <styledEl.HelpLink>Need help?</styledEl.HelpLink>
        </styledEl.Title>
      </ModalHeader>
      <styledEl.SwapInfo>
        <TokenLogo token={inputToken} size={55} />
        <styledEl.SetTitle>Set approval amount</styledEl.SetTitle>
        <SwapAmountPreview />
      </styledEl.SwapInfo>
      <ApprovalAmountInput initialAmount={initialAmountToApprove} tokenWithLogo={inputToken} />
      <styledEl.BtnWrapper>
        <styledEl.ActionButton disabled={isInvalid} onClick={OnConfirm}>
          {isInvalid ? 'Amount must be at least trade amount' : 'Confirm'}
        </styledEl.ActionButton>
      </styledEl.BtnWrapper>
    </styledEl.Wrapper>
  )
}
