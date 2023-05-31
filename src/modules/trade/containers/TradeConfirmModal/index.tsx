import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import React, { useCallback } from 'react'

import { CloseIcon } from 'legacy/theme'
import { isSupportedChain } from 'legacy/utils/supportedChainId'

import * as styledEl from 'modules/limitOrders/containers/LimitOrdersConfirmModal/styled'
import { TradeConfirmation } from 'modules/trade/pure/TradeConfirmation'
import { useWalletDisplayedAddress, useWalletInfo } from 'modules/wallet'

import { useWalletStatusIcon } from 'common/hooks/useWalletStatusIcon'
import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'
import { OrderSubmittedContent } from 'common/pure/OrderSubmittedContent'
import { TokenAmount } from 'common/pure/TokenAmount'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { tradeConfirmStateAtom, updateTradeConfirmStateAtom } from '../../state/tradeConfirmStateAtom'

const description = `Almost there! \n Follow these steps:`
const operationLabel = 'order'
const operationSubmittedMessage = 'The order is submitted and ready to be settled.'

export function TradeConfirmModal() {
  const { chainId } = useWalletInfo()
  const walletAddress = useWalletDisplayedAddress()
  const statusIcon = useWalletStatusIcon()

  const { isPending, transactionHash, confirmationState, error } = useAtomValue(tradeConfirmStateAtom)
  const updateState = useUpdateAtom(updateTradeConfirmStateAtom)

  const onDismiss = useCallback(() => {
    updateState({ isPending: false, transactionHash: null, confirmationState: null })
  }, [updateState])

  if (!isSupportedChain(chainId)) return null

  if (error) {
    return <TransactionErrorContent message={error} onDismiss={onDismiss} />
  }

  if (confirmationState && isPending) {
    const { inputCurrencyInfo, outputCurrencyInfo } = confirmationState
    const inputAmount = inputCurrencyInfo.amount
    const outputAmount = outputCurrencyInfo.amount

    const title = (
      <>
        Placing an order <TokenAmount amount={inputAmount} tokenSymbol={inputAmount?.currency} /> for{' '}
        <TokenAmount amount={outputAmount} tokenSymbol={outputAmount?.currency} />
      </>
    )

    return (
      <ConfirmationPendingContent
        onDismiss={onDismiss}
        walletAddress={walletAddress}
        statusIcon={statusIcon}
        title={title}
        description={description}
        operationLabel={operationLabel}
        operationSubmittedMessage={operationSubmittedMessage}
      />
    )
  }

  // TODO: use <TransactionSubmittedContent/> for Swap
  if (transactionHash) {
    return <OrderSubmittedContent chainId={chainId} onDismiss={onDismiss} hash={transactionHash} />
  }

  if (confirmationState) {
    return (
      <styledEl.ConfirmModalWrapper>
        <styledEl.ConfirmHeader>
          <styledEl.ConfirmHeaderTitle>Review limit order</styledEl.ConfirmHeaderTitle>
          <CloseIcon onClick={onDismiss} />
        </styledEl.ConfirmHeader>
        <TradeConfirmation {...confirmationState}>{confirmationState.children}</TradeConfirmation>
      </styledEl.ConfirmModalWrapper>
    )
  }

  // TODO: Error state

  return null
}
