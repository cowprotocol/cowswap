import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import { useCallback } from 'react'
import TradeGp from 'state/swap/TradeGp'
import { Percent } from '@uniswap/sdk-core'
import { Field } from 'state/swap/actions'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { swapConfirmAtom } from 'pages/Swap/state/swapConfirmAtom'

export interface ConfirmSwapModalSetupProps {
  trade: TradeGp | undefined
  recipient: string | null
  allowedSlippage: Percent
  handleSwap: () => void
  onUserInput: (field: Field, txHash: string) => void
  priceImpact?: Percent
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const { trade, recipient, allowedSlippage, priceImpact, handleSwap, onUserInput } = props

  const { showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash } = useAtomValue(swapConfirmAtom)
  const setSwapState = useUpdateAtom(swapConfirmAtom)

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [setSwapState, attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [setSwapState, attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  return (
    <ConfirmSwapModal
      isOpen={showConfirm}
      trade={trade}
      originalTrade={tradeToConfirm}
      onAcceptChanges={handleAcceptChanges}
      attemptingTxn={attemptingTxn}
      txHash={txHash}
      recipient={recipient}
      allowedSlippage={allowedSlippage}
      priceImpact={priceImpact}
      onConfirm={handleSwap}
      swapErrorMessage={swapErrorMessage}
      onDismiss={handleConfirmDismiss}
    />
  )
}
