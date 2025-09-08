import { ReactNode } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { ModalHeader } from '@cowprotocol/ui'

import * as styledEl from './styled'

import { useAmountsToSign } from '../../../trade'
import { useSetChangeApproveAmountState } from '../../state'

export function ChangeApproveAmountModal(): ReactNode {
  const setChangeApproveAmountState = useSetChangeApproveAmountState()
  const { maximumSendSellAmount } = useAmountsToSign() || {}

  const onBack = (): void => {
    setChangeApproveAmountState({ isModalOpen: false })
  }

  if (!maximumSendSellAmount) return null

  const token = getWrappedToken(maximumSendSellAmount.currency)

  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack}>
        <styledEl.Title>
          <div>Edit partial approval</div>
          <styledEl.HelpLink>Need help?</styledEl.HelpLink>
        </styledEl.Title>
      </ModalHeader>
      <styledEl.SwapInfo>
        <TokenLogo token={token} size={55} />
        <styledEl.SetTitle>Set approval amount</styledEl.SetTitle>
      </styledEl.SwapInfo>
    </styledEl.Wrapper>
  )
}
