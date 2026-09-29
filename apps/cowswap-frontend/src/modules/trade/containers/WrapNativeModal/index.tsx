import { useCallback } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'
import { useWrapNativeScreenState } from '../../hooks/useWrapNativeScreenState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WrapNativeModal() {
  const [{ sendAmount, receiveAmount }, setWrapNativeState] = useWrapNativeScreenState()

  const state = useDerivedTradeState()

  const { inputCurrencyAmount, outputCurrency } = state || {}

  const handleDismiss = useCallback(() => {
    setWrapNativeState({ isOpen: false })
  }, [setWrapNativeState])

  const inputCurrency = inputCurrencyAmount?.currency
  const isNativeIn = !!inputCurrency && getIsNativeToken(inputCurrency)

  const operationLabel = isNativeIn ? t`Wrapping` : t`Unwrapping`

  const sentAmount = <TokenAmount amount={sendAmount ?? inputCurrencyAmount} tokenSymbol={inputCurrency} />
  const receivedAmount = receiveAmount ? (
    <TokenAmount amount={receiveAmount} tokenSymbol={outputCurrency} />
  ) : (
    <TokenSymbol token={outputCurrency} />
  )
  const inputSymbol = <TokenSymbol token={inputCurrency} />

  const title = (
    <span>
      {isNativeIn ? (
        <Trans>
          Wrapping {sentAmount} to {receivedAmount}
        </Trans>
      ) : (
        <Trans>
          Unwrapping {sentAmount} to {receivedAmount}
        </Trans>
      )}
    </span>
  )

  return (
    <ConfirmationPendingContent
      onDismiss={handleDismiss}
      title={title}
      description={isNativeIn ? <Trans>Wrapping {inputSymbol}</Trans> : <Trans>Unwrapping {inputSymbol}</Trans>}
      operationLabel={operationLabel.toLowerCase()}
    />
  )
}
