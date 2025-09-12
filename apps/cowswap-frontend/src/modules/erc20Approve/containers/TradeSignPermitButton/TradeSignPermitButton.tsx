import React, { ReactNode, useCallback } from 'react'

import { ButtonConfirmed, ButtonSize, HoverTooltip, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { HelpCircle } from 'react-feather'

import * as styledEl from './styled'

export type SignPermitButtonProps = {
  amountToApprove: CurrencyAmount<Currency>
  children?: ReactNode
  confirmSwap?: () => void
}

export function TradeSignPermitButton(props: SignPermitButtonProps): ReactNode {
  const { amountToApprove, children, confirmSwap } = props

  const approveAndSwap = useCallback(async (): Promise<void> => {
    if (confirmSwap) {
      confirmSwap()
    }
  }, [confirmSwap])

  return (
    <ButtonConfirmed buttonSize={ButtonSize.BIG} onClick={approveAndSwap} width="100%" marginBottom={10}>
      <styledEl.ButtonLabelWrapper>
        {children}{' '}
        <HoverTooltip
          wrapInContainer
          content={
            <Trans>
              You must give the CoW Protocol smart contracts permission to use your{' '}
              <TokenSymbol token={amountToApprove.currency} />. If you approve the default amount, you will only have to
              do this once per token.
            </Trans>
          }
        >
          <HelpCircle size="24" />
        </HoverTooltip>
      </styledEl.ButtonLabelWrapper>
    </ButtonConfirmed>
  )
}
