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
  // amount that was set by the user or by default (by default, it is equivalent to amountToSwap)
  initialAmount: CurrencyAmount<Currency> | null | undefined
  // amount that needed to be swapped
  amountToSwap: CurrencyAmount<Currency> | null | undefined
  isInvalid?: boolean
  onBack: () => void
  onConfirm: () => void
  onReset: () => void
}

export function ChangeApproveAmountModalPure({
  inputToken,
  initialAmount,
  amountToSwap,
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
        <TokenLogo token={inputToken} size={55} />
        <styledEl.SetTitle>Set approval amount</styledEl.SetTitle>
        <SwapAmountPreview />
      </styledEl.SwapInfo>
      <ApprovalAmountInput
        onReset={onReset}
        initialApproveAmount={initialAmount}
        tokenWithLogo={inputToken}
        amountToSwap={amountToSwap}
      />
      <styledEl.BtnWrapper>
        <styledEl.ActionButton disabled={isInvalid} onClick={onConfirm}>
          {isInvalid ? 'Amount must be at least trade amount' : 'Confirm'}
        </styledEl.ActionButton>
      </styledEl.BtnWrapper>
    </styledEl.Wrapper>
  )
}
