import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { ModalHeader } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import * as styledEl from './styled'

import { ApprovalAmountInput } from '../ApprovalAmountInput/ApprovalAmountInput'
import { SwapAmountPreview } from '../SwapAmountPreview/SwapAmountPreview'

export interface ChangeApproveAmountModalPureProps {
  inputToken: TokenWithLogo | null
  initialAmount?: CurrencyAmount<Currency> | null
  isInvalid?: boolean
  onBack: () => void
  onConfirm: () => void
  onReset: () => void
}

export function ChangeApproveAmountModalPure({
  inputToken,
  initialAmount,
  isInvalid,
  onBack,
  onConfirm,
  onReset,
}: ChangeApproveAmountModalPureProps): ReactNode {
  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack}>
        <styledEl.Title>
          <div>Edit partial approval</div>
        </styledEl.Title>
      </ModalHeader>
      <styledEl.SwapInfo>
        <TokenLogo token={inputToken} size={54} />
        <styledEl.SetTitle>Set approval amount</styledEl.SetTitle>
        <SwapAmountPreview />
      </styledEl.SwapInfo>
      <ApprovalAmountInput onReset={onReset} initialAmount={initialAmount} tokenWithLogo={inputToken} />
      <styledEl.BtnWrapper>
        <styledEl.ActionButton disabled={isInvalid} onClick={onConfirm}>
          {isInvalid ? 'Amount must be at least trade amount' : 'Confirm'}
        </styledEl.ActionButton>
      </styledEl.BtnWrapper>
    </styledEl.Wrapper>
  )
}
