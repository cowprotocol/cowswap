import { ReactNode, useState } from 'react'

import { usePreventDoubleExecution } from '@cowprotocol/common-hooks'
import { ButtonError, ButtonSize, HelpTooltip, TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'
import { useSolanaWrapAndDelegateCallback } from '../../hooks/useSolanaWrapAndDelegateCallback'

export interface SolanaWrapAndDelegateButtonProps {
  isDisabled?: boolean
  clickEvent?: string
}

export function SolanaWrapAndDelegateButton({ isDisabled, clickEvent }: SolanaWrapAndDelegateButtonProps): ReactNode {
  const state = useDerivedTradeState()
  const sellAmount = state?.inputCurrencyAmount ? BigInt(state.inputCurrencyAmount.quotient.toString()) : undefined
  const wrapAndDelegate = useSolanaWrapAndDelegateCallback(sellAmount)
  const [error, setError] = useState<string | null>(null)

  const { callback: onClick, isExecuting } = usePreventDoubleExecution(async () => {
    setError(null)

    try {
      await wrapAndDelegate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  })

  return (
    <ButtonError
      id="do-trade-button"
      buttonSize={ButtonSize.BIG}
      onClick={onClick}
      disabled={isDisabled || !wrapAndDelegate || isExecuting}
      data-click-event={clickEvent}
    >
      <div>
        <Trans>
          Wrap <TokenSymbol token={state?.inputCurrency} length={6} /> and Swap
        </Trans>
        {error && <HelpTooltip placement="top" text={<div>{error}</div>} />}
      </div>
    </ButtonError>
  )
}
