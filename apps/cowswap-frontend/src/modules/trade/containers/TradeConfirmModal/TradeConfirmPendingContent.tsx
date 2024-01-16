import React from 'react'

import { TokenAmount } from '@cowprotocol/ui'
import { useWalletDisplayedAddress } from '@cowprotocol/wallet'

import { useWalletStatusIcon } from 'common/hooks/useWalletStatusIcon'
import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'
import { TradeAmounts } from 'common/types'

const description = `Almost there! \n Follow these steps:`
const operationLabel = 'order'
const operationSubmittedMessage = 'The order is submitted and ready to be settled.'

export function TradeConfirmPendingContent({
  pendingTrade,
  onDismiss,
}: {
  pendingTrade: TradeAmounts
  onDismiss(): void
}) {
  const { inputAmount, outputAmount } = pendingTrade

  const walletAddress = useWalletDisplayedAddress()
  const statusIcon = useWalletStatusIcon()

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
