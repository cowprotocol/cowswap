import React, { ReactNode } from 'react'

import { ButtonConfirmed, ButtonSize, HoverTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { HelpCircle } from 'react-feather'

import * as styledEl from './styled'

import { ApprovalTooltip } from '../../pure/ApprovalTooltip'

export type SignPermitButtonProps = {
  amountToApprove: CurrencyAmount<Currency>
  children?: ReactNode
  confirmSwap?: () => void
}

// todo for new flow only
export function TradeSignPermitButton(props: SignPermitButtonProps): ReactNode {
  const { amountToApprove, children, confirmSwap } = props

  return (
    <ButtonConfirmed buttonSize={ButtonSize.BIG} onClick={confirmSwap} width="100%" marginBottom={10}>
      <styledEl.ButtonLabelWrapper>
        {children}{' '}
        <HoverTooltip wrapInContainer content={<ApprovalTooltip currency={amountToApprove.currency} />}>
          <HelpCircle size="24" />
        </HoverTooltip>
      </styledEl.ButtonLabelWrapper>
    </ButtonConfirmed>
  )
}
