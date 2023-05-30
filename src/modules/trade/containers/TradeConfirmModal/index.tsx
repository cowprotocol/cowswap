import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import React, { useCallback } from 'react'

import { isSupportedChain } from 'legacy/utils/supportedChainId'

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

export interface TradeConfirmModalProps {
  children: JSX.Element
}

export function TradeConfirmModal(props: TradeConfirmModalProps) {
  const { children } = props

  const { chainId } = useWalletInfo()
  const walletAddress = useWalletDisplayedAddress()
  const statusIcon = useWalletStatusIcon()

  const { pendingTrade, transactionHash, error } = useAtomValue(tradeConfirmStateAtom)
  const updateState = useUpdateAtom(updateTradeConfirmStateAtom)

  const onDismiss = useCallback(() => {
    updateState({ pendingTrade: null, transactionHash: null })
  }, [updateState])

  if (!isSupportedChain(chainId)) return null

  if (error) {
    return <TransactionErrorContent message={error} onDismiss={onDismiss} />
  }

  if (pendingTrade) {
    const { inputAmount, outputAmount } = pendingTrade

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

  return children
}
