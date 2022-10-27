import React from 'react'
import { LimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'
import { LimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { ButtonSize } from 'theme'
import { TradeApproveButton } from '@cow/common/containers/TradeApprove/TradeApproveButton'

export interface TradeButtonsParams {
  tradeState: LimitOrdersTradeState
}

interface ButtonConfig {
  disabled: boolean
  text: string
}

interface ButtonCallback {
  (params: TradeButtonsParams): JSX.Element | null
}

export function SwapButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled: boolean
  onClick?: () => void
}) {
  return (
    <ButtonPrimary onClick={onClick} disabled={disabled} buttonSize={ButtonSize.BIG}>
      <Trans>{children}</Trans>
    </ButtonPrimary>
  )
}

export const limitOrdersTradeButtonsMap: { [key in LimitOrdersFormState]: ButtonConfig | ButtonCallback } = {
  [LimitOrdersFormState.LOADING]: {
    disabled: true,
    text: 'Loading...',
  },
  [LimitOrdersFormState.CAN_TRADE]: {
    disabled: false,
    text: 'Review limit order',
  },
  [LimitOrdersFormState.NOT_APPROVED]: ({ tradeState }: TradeButtonsParams) => {
    const amountToApprove = tradeState.inputCurrencyAmount

    return (
      <>
        {!!amountToApprove && (
          <TradeApproveButton amountToApprove={amountToApprove}>
            <SwapButton disabled={true}>
              <Trans>Swap</Trans>
            </SwapButton>
          </TradeApproveButton>
        )}
      </>
    )
  },
}
