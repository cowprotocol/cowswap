import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { useCallback, useMemo } from 'react'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  OperationType,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
import SwapModalFooter from 'components/swap/SwapModalFooter'
import SwapModalHeader from 'components/swap/SwapModalHeader'
import TradeGp from 'state/swap/TradeGp'
import { useWalletDetails } from '@cow/modules/wallet'
import { SwapConfirmState } from '@cow/modules/swap/state/swapConfirmAtom'
import { RateInfoParams } from '@cow/common/pure/RateInfo'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
/*
function tradeMeaningfullyDiffers(
  ...args:
    | [V2Trade<Currency, Currency, TradeType>, V2Trade<Currency, Currency, TradeType>]
    | [V3Trade<Currency, Currency, TradeType>, V3Trade<Currency, Currency, TradeType>]
): boolean {
  const [tradeA, tradeB] = args
*/
function tradeMeaningfullyDiffers(tradeA: TradeGp, tradeB: TradeGp): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

export default function ConfirmSwapModal({
  trade,
  swapConfirmState,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  priceImpact,
  PendingTextComponent,
  rateInfoParams,
}: {
  swapConfirmState: SwapConfirmState
  trade: TradeGp | undefined
  recipient: string | null
  priceImpact?: Percent
  allowedSlippage: Percent
  onAcceptChanges: () => void
  onConfirm: () => void
  onDismiss: () => void
  PendingTextComponent: (props: { trade: TradeGp | undefined }) => JSX.Element
  rateInfoParams: RateInfoParams
}) {
  const { swapErrorMessage, showConfirm, attemptingTxn, txHash, tradeToConfirm: originalTrade } = swapConfirmState
  const { allowsOffchainSigning } = useWalletDetails()
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        rateInfoParams={rateInfoParams}
        allowsOffchainSigning={allowsOffchainSigning}
        allowedSlippage={allowedSlippage}
        priceImpact={priceImpact}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [
    trade,
    allowsOffchainSigning,
    allowedSlippage,
    priceImpact,
    recipient,
    showAcceptChanges,
    onAcceptChanges,
    rateInfoParams,
  ])

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter onConfirm={onConfirm} disabledConfirm={showAcceptChanges} swapErrorMessage={swapErrorMessage} />
    ) : null
  }, [onConfirm, showAcceptChanges, swapErrorMessage, trade])

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={<Trans>Confirm Swap</Trans>}
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={showConfirm}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={<PendingTextComponent trade={trade} />}
      currencyToAdd={trade?.outputAmount.currency}
      operationType={OperationType.ORDER_SIGN}
    />
  )
}
