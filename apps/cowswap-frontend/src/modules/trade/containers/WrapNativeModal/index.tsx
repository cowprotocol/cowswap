import { useCallback } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'
import { useWrapNativeScreenState } from '../../hooks/useWrapNativeScreenState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WrapNativeModal() {
  const [, setWrapNativeState] = useWrapNativeScreenState()

  const state = useDerivedTradeState()

  const { inputCurrencyAmount, outputCurrency } = state || {}

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
