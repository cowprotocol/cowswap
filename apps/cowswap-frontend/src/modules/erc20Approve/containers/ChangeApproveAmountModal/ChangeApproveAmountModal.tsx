import { ReactNode, useCallback } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { ModalHeader } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { useAmountsToSign } from '../../../trade'
import { useSetChangeApproveAmountState } from '../../state'
import { useCustomApproveAmountState, useUpdateCustomApproveAmount } from '../../state/customApproveAmountState'
import { ApprovalAmountInput } from '../ApprovalAmountInput/ApprovalAmountInput'
import { SwapAmountPreview } from '../SwapAmountPreview/SwapAmountPreview'

export function ChangeApproveAmountModal(): ReactNode {
  const setChangeApproveAmountState = useSetChangeApproveAmountState()
  const updateCustomApproveAmount = useUpdateCustomApproveAmount()
  const { maximumSendSellAmount } = useAmountsToSign() || {}

  const { isInvalid } = useCustomApproveAmountState()

  const onBack = (): void => {
    setChangeApproveAmountState({ isModalOpen: false })
  }

  const OnConfirm = useCallback(() => {
    updateCustomApproveAmount({ isConfirmed: true })
    setChangeApproveAmountState({ isModalOpen: false })
  }, [setChangeApproveAmountState, updateCustomApproveAmount])

  if (!maximumSendSellAmount) return null

  const inputToken = getWrappedToken(maximumSendSellAmount.currency)

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
      <ApprovalAmountInput initialAmount={maximumSendSellAmount} tokenWithLogo={inputToken} />
      <styledEl.BtnWrapper>
        <styledEl.ActionButton disabled={isInvalid} onClick={OnConfirm}>
          {isInvalid ? 'Amount must be at least trade amount' : 'Confirm'}
        </styledEl.ActionButton>
      </styledEl.BtnWrapper>
    </styledEl.Wrapper>
  )
}
