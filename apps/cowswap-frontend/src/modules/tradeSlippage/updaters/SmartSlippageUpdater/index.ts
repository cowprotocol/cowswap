import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useTradeConfirmState } from 'modules/trade'

import { useSmartSlippageFromBff } from './useSmartSlippageFromBff'
import { useSmartSlippageFromFeeMultiplier } from './useSmartSlippageFromFeeMultiplier'

import { smartTradeSlippageAtom } from '../../state/slippageValueAndTypeAtom'

const MAX_BPS = 500 // 5%
const MIN_BPS = 50 // 0.5%

export function SmartSlippageUpdater() {
  const setSmartSwapSlippage = useSetAtom(smartTradeSlippageAtom)

  const bffSlippageBps = useSmartSlippageFromBff()
  const feeMultiplierSlippageBps = useSmartSlippageFromFeeMultiplier()

  const { isOpen: isTradeReviewOpen } = useTradeConfirmState()

  useEffect(() => {
    // Don't update it once review is open
    if (isTradeReviewOpen) {
      return
    }
    // If both are unset, don't use smart slippage
    if (feeMultiplierSlippageBps === undefined && bffSlippageBps === undefined) {
      setSmartSwapSlippage(null)
      return
    }
    // Add both slippage values, when present
    const slippage = (feeMultiplierSlippageBps || 0) + (bffSlippageBps || 0)

    setSmartSwapSlippage(Math.max(MIN_BPS, Math.min(slippage, MAX_BPS)))
  }, [bffSlippageBps, setSmartSwapSlippage, feeMultiplierSlippageBps, isTradeReviewOpen])

  return null
}
