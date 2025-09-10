import { ReactNode, useCallback, useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { ModalHeader } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { useAmountsToSign } from '../../../trade'
import { useSetChangeApproveAmountModalState } from '../../state'
import {
  useCustomApproveAmountInputState,
  useUpdateOrResetCustomApproveAmountInputState,
} from '../../state/customApproveAmountInputState'
import { ApprovalAmountInput } from '../ApprovalAmountInput/ApprovalAmountInput'
import { SwapAmountPreview } from '../SwapAmountPreview/SwapAmountPreview'

export function ChangeApproveAmountModal(): ReactNode {
  const setChangeApproveAmountState = useSetChangeApproveAmountModalState()
  const { amount: customApproveAmountInput } = useCustomApproveAmountInputState() || {}
  const [_, resetCustomApproveAmountInput] = useUpdateOrResetCustomApproveAmountInputState()
  const { maximumSendSellAmount } = useAmountsToSign() || {}

  const { isInvalid } = useCustomApproveAmountInputState()

  const onBack = (): void => {
    setChangeApproveAmountState({ isModalOpen: false, confirmedAmount: undefined })
    resetCustomApproveAmountInput()
  }

  const OnConfirm = useCallback(() => {
    setChangeApproveAmountState({ isModalOpen: false, confirmedAmount: customApproveAmountInput ?? undefined })
  }, [setChangeApproveAmountState, customApproveAmountInput])

  const inputToken = useMemo(
    () => (maximumSendSellAmount ? getWrappedToken(maximumSendSellAmount.currency) : null),
    [maximumSendSellAmount],
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
      <ApprovalAmountInput initialAmount={maximumSendSellAmount} tokenWithLogo={inputToken} />
      <styledEl.BtnWrapper>
        <styledEl.ActionButton disabled={isInvalid} onClick={OnConfirm}>
          {isInvalid ? 'Amount must be at least trade amount' : 'Confirm'}
        </styledEl.ActionButton>
      </styledEl.BtnWrapper>
    </styledEl.Wrapper>
  )
}
