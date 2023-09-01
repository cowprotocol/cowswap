import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { Percent } from '@uniswap/sdk-core'

import { ConfirmSwapModal } from 'legacy/components/swap/ConfirmSwapModal'
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

  const handleAcceptChanges = useCallback(() => {
    trade && acceptRateUpdates(trade)
  }, [acceptRateUpdates, trade])

  // TODO: use TradeConfirmModal
  return (
    <ConfirmSwapModal
      rateInfoParams={rateInfoParams}
      swapConfirmState={swapConfirmState}
      trade={trade}
      onAcceptChanges={handleAcceptChanges}
      recipient={recipient}
      allowedSlippage={allowedSlippage}
      priceImpact={priceImpact}
      onConfirm={handleSwap}
      onDismiss={closeSwapConfirm}
    />
  )
}
