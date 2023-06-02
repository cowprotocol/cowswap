import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { useWalletDisplayedAddress } from 'modules/wallet'

import { useWalletStatusIcon } from 'common/hooks/useWalletStatusIcon'
import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'
import { GpModal } from 'common/pure/Modal'
import { TokenAmount } from 'common/pure/TokenAmount'
import { TokenSymbol } from 'common/pure/TokenSymbol'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'
import { wrapNativeStateAtom } from '../../state/wrapNativeStateAtom'

export function WrapNativeModal() {
  const [{ isOpen }, setWrapNativeState] = useAtom(wrapNativeStateAtom)

  const derivedState = useDerivedTradeState()
  const walletAddress = useWalletDisplayedAddress()
  const statusIcon = useWalletStatusIcon()

  const { inputCurrencyAmount, outputCurrency } = derivedState.state || {}

  const handleDismiss = useCallback(() => {
    setWrapNativeState({ isOpen: false })
  }, [setWrapNativeState])

  const inputCurrency = inputCurrencyAmount?.currency
  const isNativeIn = !!inputCurrency?.isNative

  const title = isNativeIn ? (
    <span>
      Wrapping <TokenAmount amount={inputCurrencyAmount} tokenSymbol={inputCurrency} /> to{' '}
      <TokenSymbol token={outputCurrency} />
    </span>
  ) : (
    <span>
      Unwrapping <TokenAmount amount={inputCurrencyAmount} tokenSymbol={inputCurrency} /> to{' '}
      <TokenSymbol token={outputCurrency} />
    </span>
  )

  const description = (
    <span>
      Unwrapping <TokenSymbol token={inputCurrency} /> <br /> Follow these steps:
    </span>
  )

  const operationLabel = isNativeIn ? 'wrapping' : 'unwrapping'

  return (
    <GpModal isOpen={isOpen} onDismiss={handleDismiss}>
      <ConfirmationPendingContent
        onDismiss={handleDismiss}
        statusIcon={statusIcon}
        title={title}
        description={description}
        operationSubmittedMessage={`The ${operationLabel} is submitted.`}
        walletAddress={walletAddress}
        operationLabel={operationLabel}
      />
    </GpModal>
  )
}
