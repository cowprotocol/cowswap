import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'

import { Percent } from '@uniswap/sdk-core'

import { ConfirmSwapModal } from 'legacy/components/swap/ConfirmSwapModal'
import { Field } from 'legacy/state/swap/actions'
import { useSwapActionHandlers } from 'legacy/state/swap/hooks'
import TradeGp from 'legacy/state/swap/TradeGp'

import { useSwapConfirmManager } from 'modules/swap/hooks/useSwapConfirmManager'
import { HandleSwapCallback } from 'modules/swap/pure/SwapButtons'
import { swapConfirmAtom } from 'modules/swap/state/swapConfirmAtom'

import { RateInfoParams } from 'common/pure/RateInfo'

export interface ConfirmSwapModalSetupProps {
  trade: TradeGp | undefined
  recipient: string | null
  allowedSlippage: Percent
  handleSwap: HandleSwapCallback
  priceImpact?: Percent
  rateInfoParams: RateInfoParams
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const { trade, recipient, allowedSlippage, priceImpact, handleSwap, rateInfoParams } = props

  const swapConfirmState = useAtomValue(swapConfirmAtom)
  const { acceptRateUpdates, closeSwapConfirm } = useSwapConfirmManager()
  const { onUserInput } = useSwapActionHandlers()

  const handleAcceptChanges = useCallback(() => {
    trade && acceptRateUpdates(trade)
  }, [acceptRateUpdates, trade])

  const handleConfirmDismiss = useCallback(() => {
    closeSwapConfirm()
    // if there was a tx hash, we want to clear the input
    if (swapConfirmState.txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [closeSwapConfirm, onUserInput, swapConfirmState.txHash])

  // TODO: use TradeConfirmModal
  return (
    <>
      <ConfirmSwapModal
        rateInfoParams={rateInfoParams}
        swapConfirmState={swapConfirmState}
        trade={trade}
        onAcceptChanges={handleAcceptChanges}
        recipient={recipient}
        allowedSlippage={allowedSlippage}
        priceImpact={priceImpact}
        onConfirm={handleSwap}
        onDismiss={handleConfirmDismiss}
      />
    </>
  )
}
