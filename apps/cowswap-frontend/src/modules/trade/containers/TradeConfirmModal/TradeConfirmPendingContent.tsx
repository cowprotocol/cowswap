import { TokenAmount } from '@cowprotocol/ui'

import { ConfirmationPendingContent } from 'common/pure/ConfirmationPendingContent'
import { TradeAmounts } from 'common/types'

const description = `Almost there! \n Follow these steps:`
const operationLabel = 'order'

export function TradeConfirmPendingContent({
  pendingTrade,
  onDismiss,
}: {
  pendingTrade: TradeAmounts
  onDismiss(): void
}) {
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
      title={title}
      description={description}
      operationLabel={operationLabel}
    />
  )
}
