import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { TokenAmount, TokenSymbol } from '@cowprotocol/ui'
import { useWalletDisplayedAddress } from '@cowprotocol/wallet'

import { useWalletStatusIcon } from 'common/hooks/useWalletStatusIcon'
import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'
import { CowModal } from 'common/pure/Modal'

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
  const isNativeIn = !!inputCurrency && getIsNativeToken(inputCurrency)

  const wrapUnwrapLabel = isNativeIn ? 'Wrapping' : 'Unwrapping'
  const operationLabel = wrapUnwrapLabel.toLowerCase()

  return (
    <CowModal isOpen={isOpen} onDismiss={handleDismiss}>
      <ConfirmationPendingContent
        onDismiss={handleDismiss}
        statusIcon={statusIcon}
        title={
          <span>
            {wrapUnwrapLabel} <TokenAmount amount={inputCurrencyAmount} tokenSymbol={inputCurrency} /> to{' '}
            <TokenSymbol token={outputCurrency} />
          </span>
        }
        description={
          <span>
            {wrapUnwrapLabel} <TokenSymbol token={inputCurrency} /> <br /> Follow these steps:
          </span>
        }
        operationSubmittedMessage={`The ${operationLabel} is submitted.`}
        walletAddress={walletAddress}
        operationLabel={operationLabel}
      />
    </CowModal>
  )
}
