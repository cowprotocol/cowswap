import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { ModalHeader } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans, useLingui } from '@lingui/react/macro'

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
  const { t } = useLingui()

  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack}>
        <styledEl.Title>
          <div>
            <Trans>Edit partial approval</Trans>
          </div>
        </styledEl.Title>
      </ModalHeader>
      <styledEl.SwapInfo>
        <TokenLogo token={inputToken} size={55} />
        <styledEl.SetTitle>
          <Trans>Set approval amount</Trans>
        </styledEl.SetTitle>
        <SwapAmountPreview />
      </styledEl.SwapInfo>
      <ApprovalAmountInput onReset={onReset} initialAmount={initialAmount} tokenWithLogo={inputToken} />
      <styledEl.BtnWrapper>
        <styledEl.ActionButton disabled={isInvalid} onClick={onConfirm}>
          {isInvalid ? t`Amount must be at least trade amount` : t`Confirm`}
        </styledEl.ActionButton>
      </styledEl.BtnWrapper>
    </styledEl.Wrapper>
  )
}
