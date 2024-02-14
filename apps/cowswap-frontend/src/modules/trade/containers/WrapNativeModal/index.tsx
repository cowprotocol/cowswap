import { useCallback } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'
import { useWrapNativeScreenState } from '../../hooks/useWrapNativeScreenState'

export function WrapNativeModal() {
  const [, setWrapNativeState] = useWrapNativeScreenState()

  const derivedState = useDerivedTradeState()

  const { inputCurrencyAmount, outputCurrency } = derivedState.state || {}

  const handleDismiss = useCallback(() => {
    setWrapNativeState({ isOpen: false })
  }, [setWrapNativeState])

  const inputCurrency = inputCurrencyAmount?.currency
  const isNativeIn = !!inputCurrency && getIsNativeToken(inputCurrency)

  const operationLabel = isNativeIn ? 'Wrapping' : 'Unwrapping'

  const title = (
    <span>
      {operationLabel} <TokenAmount amount={inputCurrencyAmount} tokenSymbol={inputCurrency} /> to{' '}
      <TokenSymbol token={outputCurrency} />
    </span>
  )

  return (
    <ConfirmationPendingContent
      onDismiss={handleDismiss}
      title={title}
      description={
        <>
          {operationLabel} <TokenSymbol token={inputCurrency} />
        </>
      }
      operationLabel={operationLabel.toLowerCase()}
    />
  )
}
