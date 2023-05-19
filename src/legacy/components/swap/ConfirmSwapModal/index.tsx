import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { useCallback, useMemo } from 'react'

import TradeGp from 'state/swap/TradeGp'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  OperationType,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
import { SwapModalFooter } from 'components/swap/SwapModalFooter'
import SwapModalHeader from 'components/swap/SwapModalHeader'
import { useWalletDetails } from 'modules/wallet'
import { SwapConfirmState } from 'modules/swap/state/swapConfirmAtom'
import { RateInfoParams } from 'common/pure/RateInfo'
import { useIsSafeApprovalBundle } from 'modules/limitOrders/hooks/useIsSafeApprovalBundle'
import { TokenSymbol } from 'common/pure/TokenSymbol'
import { TokenAmount } from 'common/pure/TokenAmount'

type ConfirmSwapModalProps = {
  swapConfirmState: SwapConfirmState
  trade: TradeGp | undefined
  recipient: string | null
  priceImpact?: Percent
  allowedSlippage: Percent
  onAcceptChanges: () => void
  onConfirm: () => void
  onDismiss: () => void
  rateInfoParams: RateInfoParams
}

export function ConfirmSwapModal({
  trade,
  swapConfirmState,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  priceImpact,
  rateInfoParams,
}: ConfirmSwapModalProps) {
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

  const isSafeApprovalBundle = useIsSafeApprovalBundle(trade?.maximumAmountIn(allowedSlippage))
  const buttonText = useMemo(
    () =>
      isSafeApprovalBundle ? (
        <>
          Confirm (Approve&nbsp;{<TokenSymbol token={trade?.inputAmount?.currency.wrapped} length={6} />}&nbsp;and Swap)
        </>
      ) : undefined,
    [isSafeApprovalBundle, trade?.inputAmount?.currency.wrapped]
  )

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        buttonText={buttonText}
      />
    ) : null
  }, [buttonText, onConfirm, showAcceptChanges, swapErrorMessage, trade])

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
      pendingText={<PendingText trade={trade} />}
      currencyToAdd={trade?.outputAmount.currency}
      operationType={OperationType.ORDER_SIGN}
    />
  )
}

function PendingText(props: { trade: TradeGp | undefined }): JSX.Element {
  const { trade } = props
  const inputAmount = trade?.inputAmount
  const outputAmount = trade?.outputAmount

  return (
    <Trans>
      Swapping <TokenAmount amount={inputAmount} tokenSymbol={inputAmount?.currency} /> for{' '}
      <TokenAmount amount={outputAmount} tokenSymbol={outputAmount?.currency} />
    </Trans>
  )
}

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
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
