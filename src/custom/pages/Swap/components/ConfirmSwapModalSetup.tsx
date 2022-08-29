import ConfirmSwapModal from 'components/swap/ConfirmSwapModal'
import { useCallback } from 'react'
import TradeGp from 'state/swap/TradeGp'
import { Percent } from '@uniswap/sdk-core'
import { Field } from 'state/swap/actions'
import { useAtomValue } from 'jotai/utils'
import { swapConfirmAtom } from 'pages/Swap/state/swapConfirmAtom'
import { HandleSwapCallback } from 'pages/Swap/hooks/useHandleSwap'
import { useSwapConfirmManager } from 'pages/Swap/hooks/useSwapConfirmManager'

export interface ConfirmSwapModalSetupProps {
  trade: TradeGp | undefined
  recipient: string | null
  allowedSlippage: Percent
  handleSwap: HandleSwapCallback
  onUserInput: (field: Field, txHash: string) => void
  priceImpact?: Percent
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const { trade, recipient, allowedSlippage, priceImpact, handleSwap, onUserInput } = props

  const swapConfirmState = useAtomValue(swapConfirmAtom)
  const { txHash } = swapConfirmState
  const { acceptRateUpdates, closeSwapConfirm } = useSwapConfirmManager()

  const handleAcceptChanges = useCallback(() => {
    acceptRateUpdates(trade!)
  }, [acceptRateUpdates, trade])

  const handleConfirmDismiss = useCallback(() => {
    closeSwapConfirm()
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [closeSwapConfirm, onUserInput, txHash])

  return (
    <ConfirmSwapModal
      swapConfirmState={swapConfirmState}
      trade={trade}
      onAcceptChanges={handleAcceptChanges}
      recipient={recipient}
      allowedSlippage={allowedSlippage}
      priceImpact={priceImpact}
      onConfirm={handleSwap}
      onDismiss={handleConfirmDismiss}
    />
  )
}
